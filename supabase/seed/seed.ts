import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Common Core Standards for Grades 5-8
const standards = [
  // Grade 6
  { code: "6.RP.A.1", grade: 6, domain: "RP", cluster: "A", description: "Understand the concept of a ratio and use ratio language" },
  { code: "6.RP.A.2", grade: 6, domain: "RP", cluster: "A", description: "Understand unit rate and use rate language" },
  { code: "6.RP.A.3", grade: 6, domain: "RP", cluster: "A", description: "Use ratio and rate reasoning to solve real-world problems" },
  { code: "6.NS.A.1", grade: 6, domain: "NS", cluster: "A", description: "Interpret and compute quotients of fractions" },
  { code: "6.NS.B.3", grade: 6, domain: "NS", cluster: "B", description: "Fluently add, subtract, multiply, and divide multi-digit decimals" },
  { code: "6.NS.C.6", grade: 6, domain: "NS", cluster: "C", description: "Understand a rational number as a point on the number line" },
  { code: "6.EE.A.2", grade: 6, domain: "EE", cluster: "A", description: "Write, read, and evaluate expressions in which letters stand for numbers" },
  { code: "6.EE.B.5", grade: 6, domain: "EE", cluster: "B", description: "Understand solving an equation or inequality as a process of answering a question" },
  { code: "6.EE.B.7", grade: 6, domain: "EE", cluster: "B", description: "Solve real-world and mathematical problems by writing and solving equations" },
  { code: "6.G.A.1", grade: 6, domain: "G", cluster: "A", description: "Find the area of triangles, quadrilaterals, and polygons" },

  // Grade 7
  { code: "7.RP.A.1", grade: 7, domain: "RP", cluster: "A", description: "Compute unit rates associated with ratios of fractions" },
  { code: "7.RP.A.2", grade: 7, domain: "RP", cluster: "A", description: "Recognize and represent proportional relationships" },
  { code: "7.RP.A.3", grade: 7, domain: "RP", cluster: "A", description: "Use proportional relationships to solve multi-step ratio and percent problems" },
  { code: "7.NS.A.1", grade: 7, domain: "NS", cluster: "A", description: "Apply and extend previous understandings of addition and subtraction" },
  { code: "7.NS.A.2", grade: 7, domain: "NS", cluster: "A", description: "Apply and extend previous understandings of multiplication and division" },
  { code: "7.EE.A.1", grade: 7, domain: "EE", cluster: "A", description: "Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions" },
  { code: "7.EE.B.4", grade: 7, domain: "EE", cluster: "B", description: "Use variables to represent quantities in a real-world or mathematical problem" },
  { code: "7.G.A.1", grade: 7, domain: "G", cluster: "A", description: "Solve problems involving scale drawings of geometric figures" },
  { code: "7.G.B.4", grade: 7, domain: "G", cluster: "B", description: "Know the formulas for the area and circumference of a circle" },
  { code: "7.G.B.6", grade: 7, domain: "G", cluster: "B", description: "Solve real-world and mathematical problems involving area, volume and surface area" },

  // Grade 8
  { code: "8.NS.A.1", grade: 8, domain: "NS", cluster: "A", description: "Know that numbers that are not rational are called irrational" },
  { code: "8.NS.A.2", grade: 8, domain: "NS", cluster: "A", description: "Use rational approximations of irrational numbers" },
  { code: "8.EE.A.1", grade: 8, domain: "EE", cluster: "A", description: "Know and apply the properties of integer exponents" },
  { code: "8.EE.B.5", grade: 8, domain: "EE", cluster: "B", description: "Graph proportional relationships, interpreting the unit rate as the slope" },
  { code: "8.EE.C.7", grade: 8, domain: "EE", cluster: "C", description: "Solve linear equations in one variable" },
  { code: "8.EE.C.8", grade: 8, domain: "EE", cluster: "C", description: "Analyze and solve pairs of simultaneous linear equations" },
  { code: "8.F.A.1", grade: 8, domain: "F", cluster: "A", description: "Understand that a function is a rule that assigns to each input exactly one output" },
  { code: "8.F.B.4", grade: 8, domain: "F", cluster: "B", description: "Construct a function to model a linear relationship between two quantities" },
  { code: "8.G.A.1", grade: 8, domain: "G", cluster: "A", description: "Verify experimentally the properties of rotations, reflections, and translations" },
  { code: "8.G.B.7", grade: 8, domain: "G", cluster: "B", description: "Apply the Pythagorean Theorem to determine unknown side lengths" },
];

async function seed() {
  console.log("Starting seed...");

  // Insert standards
  console.log("Inserting standards...");
  const { error: standardsError } = await supabase
    .from("standards")
    .upsert(standards, { onConflict: "code" });

  if (standardsError) {
    console.error("Error inserting standards:", standardsError);
    return;
  }

  // Get standards for mapping
  const { data: standardsData } = await supabase
    .from("standards")
    .select("id, code");

  const standardMap = new Map(standardsData?.map((s) => [s.code, s.id]));

  // Read and parse problems CSV
  console.log("Reading problems CSV...");
  const csvPath = join(__dirname, "problems.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").slice(1); // Skip header

  const problems = lines
    .filter((line) => line.trim())
    .map((line) => {
      // Parse CSV with quoted fields
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      fields.push(current);

      const [
        grade,
        standardCode,
        difficulty,
        prompt,
        answerType,
        canonicalAnswer,
        canonicalEquation,
        solutionSteps,
        misconceptionTags,
      ] = fields;

      return {
        grade: parseInt(grade),
        standard_id: standardMap.get(standardCode),
        difficulty: parseInt(difficulty),
        prompt,
        answer_type: answerType,
        canonical_answer: canonicalAnswer,
        canonical_equation: canonicalEquation || null,
        solution_steps: JSON.parse(solutionSteps || "[]"),
        misconception_tags: JSON.parse(misconceptionTags || "[]"),
        active: true,
        source: "vetted_bank",
      };
    })
    .filter((p) => p.standard_id); // Filter out problems without valid standards

  console.log(`Inserting ${problems.length} problems...`);
  const { error: problemsError } = await supabase
    .from("problems")
    .upsert(problems);

  if (problemsError) {
    console.error("Error inserting problems:", problemsError);
    return;
  }

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
