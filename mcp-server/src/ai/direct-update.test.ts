import { describe, expect, test } from "bun:test";
import { parseDirectDescriptionUpdate } from "./direct-update";

const context = {
  experiences: [
    {
      company: "Livlong 365 (IIFL Group)",
      role: "Assistant Manager – Software Development",
    },
    {
      company: "Hapinee Solutions Pvt. Ltd.",
      role: "Android Developer Intern",
    },
  ],
  projects: [{ name: "Claratto" }, { name: "CinematicTale" }, { name: "OpenClaw" }],
};

describe("parseDirectDescriptionUpdate", () => {
  test("maps an explicit experience rewrite without calling the LLM", () => {
    const description = "Promoted within two years. Built the Lab Test platform.";
    const delta = parseDirectDescriptionUpdate(
      `Use update_experience for the existing Assistant Manager – Software Development record at Livlong 365 (IIFL Group). Set only its description to: ${description}`,
      context,
    );

    expect(delta).toEqual({
      updateExperiences: [
        {
          company: "Livlong 365 (IIFL Group)",
          role: "Assistant Manager – Software Development",
          description,
        },
      ],
    });
  });

  test("normalizes Unicode dashes when matching an experience role", () => {
    const delta = parseDirectDescriptionUpdate(
      "Update Assistant Manager - Software Development at Livlong 365 (IIFL Group). Replace its description with exactly: New wording.",
      context,
    );

    expect(delta?.updateExperiences?.[0]?.role).toBe(
      "Assistant Manager – Software Development",
    );
  });

  test("maps an explicit project rewrite by canonical project name", () => {
    const description = "Reduced page payload 96%.";
    const delta = parseDirectDescriptionUpdate(
      `Update my existing CinematicTale project. Replace its description with exactly: ${description}`,
      context,
    );

    expect(delta).toEqual({
      updateProjects: [{ name: "CinematicTale", description }],
    });
  });

  test("does not guess when a company matches multiple roles", () => {
    const ambiguousContext = {
      ...context,
      experiences: [
        ...context.experiences,
        { company: "Livlong 365 (IIFL Group)", role: "Management Trainee" },
      ],
    };

    expect(
      parseDirectDescriptionUpdate(
        "Update my Livlong 365 (IIFL Group) description to: New wording.",
        ambiguousContext,
      ),
    ).toBeUndefined();
  });

  test("leaves non-replacement messages to the LLM parser", () => {
    expect(
      parseDirectDescriptionUpdate(
        "I built a new project called Devcard.",
        context,
      ),
    ).toBeUndefined();
  });
});
