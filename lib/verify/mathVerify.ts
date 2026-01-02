import { evaluate, fraction, number as mathNumber, MathType } from "mathjs";
import type { AnswerType } from "@/lib/constants";

interface VerificationResult {
  isCorrect: boolean;
  details: {
    method: string;
    canonicalAnswer: string;
    parsedStudentAnswer: number | string | null;
    message?: string;
  };
}

// Tolerance for decimal comparisons
const DECIMAL_TOLERANCE = 0.0001;

export function verifyAnswer(
  studentAnswer: string,
  canonicalAnswer: string,
  answerType: AnswerType
): VerificationResult {
  const method = "mathjs";
  const cleanedStudent = cleanAnswer(studentAnswer);
  const cleanedCanonical = cleanAnswer(canonicalAnswer);

  try {
    switch (answerType) {
      case "integer":
        return verifyInteger(cleanedStudent, cleanedCanonical, method);

      case "decimal":
      case "number":
        return verifyDecimal(cleanedStudent, cleanedCanonical, method);

      case "fraction":
        return verifyFraction(cleanedStudent, cleanedCanonical, method);

      case "percent":
        return verifyPercent(cleanedStudent, cleanedCanonical, method);

      case "mixed":
        return verifyMixed(cleanedStudent, cleanedCanonical, method);

      case "multi":
        return verifyMulti(cleanedStudent, cleanedCanonical, method);

      default:
        return verifyGeneric(cleanedStudent, cleanedCanonical, method);
    }
  } catch (error) {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonicalAnswer,
        parsedStudentAnswer: cleanedStudent,
        message: `Error parsing answer: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    };
  }
}

function cleanAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,/g, "")
    .replace(/\$/g, "")
    .replace(/['"]/g, "");
}

function verifyInteger(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  const studentNum = parseInt(student, 10);
  const canonicalNum = parseInt(canonical, 10);

  if (isNaN(studentNum)) {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: null,
        message: "Could not parse your answer as an integer",
      },
    };
  }

  return {
    isCorrect: studentNum === canonicalNum,
    details: {
      method,
      canonicalAnswer: canonical,
      parsedStudentAnswer: studentNum,
    },
  };
}

function verifyDecimal(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  const studentNum = parseFloat(student);
  const canonicalNum = parseFloat(canonical);

  if (isNaN(studentNum)) {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: null,
        message: "Could not parse your answer as a number",
      },
    };
  }

  const isCorrect = Math.abs(studentNum - canonicalNum) < DECIMAL_TOLERANCE;

  return {
    isCorrect,
    details: {
      method,
      canonicalAnswer: canonical,
      parsedStudentAnswer: studentNum,
    },
  };
}

function verifyFraction(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  try {
    // Try to parse as fraction
    let studentFrac: MathType;
    let canonicalFrac: MathType;

    // Handle different fraction formats: "1/2", "1 / 2", etc.
    const studentParsed = student.replace(/\s+/g, "");
    const canonicalParsed = canonical.replace(/\s+/g, "");

    if (studentParsed.includes("/")) {
      const [num, denom] = studentParsed.split("/").map(Number);
      studentFrac = fraction(num, denom);
    } else {
      studentFrac = fraction(parseFloat(studentParsed));
    }

    if (canonicalParsed.includes("/")) {
      const [num, denom] = canonicalParsed.split("/").map(Number);
      canonicalFrac = fraction(num, denom);
    } else {
      canonicalFrac = fraction(parseFloat(canonicalParsed));
    }

    const studentValue = mathNumber(studentFrac);
    const canonicalValue = mathNumber(canonicalFrac);

    const isCorrect =
      Math.abs((studentValue as number) - (canonicalValue as number)) <
      DECIMAL_TOLERANCE;

    return {
      isCorrect,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: student,
      },
    };
  } catch {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: null,
        message: "Could not parse your answer as a fraction",
      },
    };
  }
}

function verifyPercent(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  // Remove % sign and parse
  const studentClean = student.replace(/%/g, "").trim();
  const canonicalClean = canonical.replace(/%/g, "").trim();

  return verifyDecimal(studentClean, canonicalClean, method);
}

function verifyMixed(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  // Mixed numbers like "2 1/2" or "2.5"
  try {
    const studentValue = parseMixedNumber(student);
    const canonicalValue = parseMixedNumber(canonical);

    if (studentValue === null) {
      return {
        isCorrect: false,
        details: {
          method,
          canonicalAnswer: canonical,
          parsedStudentAnswer: null,
          message: "Could not parse your answer",
        },
      };
    }

    const isCorrect = Math.abs(studentValue - canonicalValue!) < DECIMAL_TOLERANCE;

    return {
      isCorrect,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: studentValue,
      },
    };
  } catch {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: null,
        message: "Could not parse your answer",
      },
    };
  }
}

function parseMixedNumber(str: string): number | null {
  const clean = str.trim();

  // Try as decimal first
  if (!clean.includes("/")) {
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  // Check for mixed number format: "2 1/2"
  const mixedMatch = clean.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const [, whole, num, denom] = mixedMatch;
    const wholeNum = parseInt(whole, 10);
    const frac = parseInt(num, 10) / parseInt(denom, 10);
    return wholeNum >= 0 ? wholeNum + frac : wholeNum - frac;
  }

  // Simple fraction: "1/2"
  const fracMatch = clean.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const [, num, denom] = fracMatch;
    return parseInt(num, 10) / parseInt(denom, 10);
  }

  return null;
}

function verifyMulti(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  // Multiple answers separated by comma or "and"
  const studentParts = student
    .split(/[,;]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
  const canonicalParts = canonical
    .split(/[,;]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();

  if (studentParts.length !== canonicalParts.length) {
    return {
      isCorrect: false,
      details: {
        method,
        canonicalAnswer: canonical,
        parsedStudentAnswer: student,
        message: `Expected ${canonicalParts.length} answer(s), got ${studentParts.length}`,
      },
    };
  }

  const allMatch = studentParts.every((sp, i) => {
    const cp = canonicalParts[i];
    // Try numeric comparison
    const spNum = parseFloat(sp);
    const cpNum = parseFloat(cp);
    if (!isNaN(spNum) && !isNaN(cpNum)) {
      return Math.abs(spNum - cpNum) < DECIMAL_TOLERANCE;
    }
    // String comparison
    return sp.toLowerCase() === cp.toLowerCase();
  });

  return {
    isCorrect: allMatch,
    details: {
      method,
      canonicalAnswer: canonical,
      parsedStudentAnswer: student,
    },
  };
}

function verifyGeneric(
  student: string,
  canonical: string,
  method: string
): VerificationResult {
  // Try mathjs evaluation for expressions
  try {
    const studentValue = evaluate(student);
    const canonicalValue = evaluate(canonical);

    if (typeof studentValue === "number" && typeof canonicalValue === "number") {
      const isCorrect = Math.abs(studentValue - canonicalValue) < DECIMAL_TOLERANCE;
      return {
        isCorrect,
        details: {
          method,
          canonicalAnswer: canonical,
          parsedStudentAnswer: studentValue,
        },
      };
    }
  } catch {
    // Fall through to string comparison
  }

  // String comparison as fallback
  const isCorrect = student.toLowerCase() === canonical.toLowerCase();

  return {
    isCorrect,
    details: {
      method,
      canonicalAnswer: canonical,
      parsedStudentAnswer: student,
    },
  };
}

export function verifyEquation(
  studentEquation: string,
  canonicalEquation: string
): boolean {
  // Normalize equations for comparison
  const normalize = (eq: string): string =>
    eq
      .replace(/\s+/g, "")
      .toLowerCase()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");

  const studentNorm = normalize(studentEquation);
  const canonicalNorm = normalize(canonicalEquation);

  // Direct match
  if (studentNorm === canonicalNorm) {
    return true;
  }

  // Try rearranged forms (e.g., "x+5=20" vs "20=x+5")
  // Split by "=" and compare sets
  const studentParts = studentNorm.split("=").sort();
  const canonicalParts = canonicalNorm.split("=").sort();

  if (studentParts.length === canonicalParts.length) {
    return studentParts.every((p, i) => p === canonicalParts[i]);
  }

  return false;
}
