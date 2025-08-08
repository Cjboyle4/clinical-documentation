function handleSubmit() {
  const inputText = document.getElementById("medicalInput").value;
  let sectionHeaders = getSectionHeaders()
  let sections = extractSections(inputText, sectionHeaders)
  
  // parseAdmissionDate(sections)
  cleanInitialDiagnosis(sections)
  parseMedicalHistorySection(sections)
  cleanDiseases(sections)
  flattenCleanedDiseases(sections)
  
  const formattedText = formatSectionsForDisplay(sections, sectionHeaders);
  document.getElementById("output").textContent = formattedText;

  
  // const sectionText = extractPastMedicalHistory(inputText);
  // const parsedEntries = parseMedicalHistorySection(sectionText);
  // const cleanedEntries = cleanDiseases(parsedEntries);
  // const pmhLine = formatPMHLine(cleanedEntries);

  // document.getElementById("output").textContent = sectionText;
  // document.getElementById("output").textContent = JSON.stringify(sections, null, 2);
  
}

function getSectionHeaders() {
  const sectionHeaders = {
    'Admission Date:': 'Admission:',
    'Chief Complaint:': 'CC:',
    'Initial Diagnosis:': 'Dx:',
    'Past Medical History:': 'PMH:'
  };
  
  return sectionHeaders;
}


function extractSections(rawText, headers) {
  const lines = rawText.split(/\r?\n/);
  const sections = {};
  const headerKeys = Object.keys(headers); // Extract keys from the headers object
  let currentHeader = null;
  let collecting = false;

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (headerKeys.includes(trimmedLine)) {
      currentHeader = trimmedLine;
      sections[currentHeader] = [];
      collecting = true;
      continue;
    }

    if (collecting) {
      if (trimmedLine === "") {
        collecting = false;
        currentHeader = null;
      } else if (currentHeader) {
        sections[currentHeader].push(trimmedLine);
      }
    }
  }

  return sections;
}



// function extractSections(rawText, headers) {
//   const lines = rawText.split(/\r?\n/);
//   const sections = {};
//   let currentHeader = null;
//   let collecting = false;

//   for (let line of lines) {
//     const trimmedLine = line.trim();

//     if (headers.includes(trimmedLine)) {
//       currentHeader = trimmedLine;
//       sections[currentHeader] = [];
//       collecting = true;
//       continue;
//     }

//     if (collecting) {
//       if (trimmedLine === "") {
//         collecting = false;
//         currentHeader = null;
//       } else if (currentHeader) {
//         sections[currentHeader].push(line.trim());
//       }
//     }
//   }

//   return sections;
// }


function parseAdmissionDate(sections) {
  const admissionArray = sections["Admission Date:"];
  if (Array.isArray(admissionArray) && admissionArray.length > 0) {
    const dateValue = admissionArray[0];
    sections["Admission Date:"] = [{ admissionDate: dateValue }];
  }
}


function cleanInitialDiagnosis(sections) {
  const diagnosisArray = sections["Initial Diagnosis:"];
  if (!Array.isArray(diagnosisArray)) return;

  const cleanedArray = diagnosisArray.map(item =>
    item.replace(/\s*\(.*?\)\s*/g, "").trim()
  );

  sections["Initial Diagnosis:"] = cleanedArray;
}




function parseMedicalHistorySection(sections) {
  const lines = sections["Past Medical History:"];
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Match lines with a colon separating date and disease
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const date = match[1].trim();
      const disease = match[2].trim();
      let comment = null;

      // Check next line for a comment
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : "";
      const commentMatch = nextLine.match(/^Comment:\s*(.+)$/);
      if (commentMatch) {
        comment = commentMatch[1].trim();
        i++; // Skip the comment line
      }

      entries.push({ date, disease, comment });
    }

    i++;
  }

  // Replace the original array with the parsed entries
  sections["Past Medical History:"] = entries;

}




function cleanDiseases(data) {
  if (!Array.isArray(data["Past Medical History:"])) return;

  const cleanedHistory = data["Past Medical History:"].map(entry => {
    let cleanedDisease = entry.disease
      .replace(/\s*\(.*?\)\s*/g, " ")  // Remove parentheses and content
      .trim();

    // Handle comma: wrap text after comma in parentheses
    const commaIndex = cleanedDisease.indexOf(",");
    if (commaIndex !== -1) {
      const beforeComma = cleanedDisease.slice(0, commaIndex).trim();
      const afterComma = cleanedDisease.slice(commaIndex + 1).trim();
      cleanedDisease = `${beforeComma} (${afterComma})`;
    }

    // If disease contains 'cancer' and there's a comment, append it in parentheses
    if (cleanedDisease.toLowerCase().includes("cancer") && entry.comment) {
      cleanedDisease += ` (${entry.comment.trim()})`;
    }

    return {
      ...entry,
      cleanedDisease
    };
  });

  // Save the cleaned array back to the original object
  data["Past Medical History:"] = cleanedHistory;
}

function flattenCleanedDiseases(sections) {
  const historyArray = sections["Past Medical History:"];
  if (!Array.isArray(historyArray)) return;

  const cleanedList = historyArray
    .map(entry => entry.cleanedDisease)
    .filter(disease => typeof disease === "string" && disease.trim() !== "");

  sections["Past Medical History:"] = cleanedList;
}




// function formatSectionsForDisplay(sections) {
//   let output = "";

//   for (const [key, values] of Object.entries(sections)) {
//     if (!Array.isArray(values) || values.length === 0) continue;

//     const formattedLine = `${key} ${values.join(", ")}`;
//     output += formattedLine + "\n"; // double line break between sections
//   }

//   return output.trim(); // remove trailing newline
// }

function formatSectionsForDisplay(sections, sectionHeaders) {
  let output = "";

  for (const [key, values] of Object.entries(sections)) {
    if (!Array.isArray(values) || values.length === 0) continue;

    // Use the value from sectionHeaders if it exists, otherwise fall back to the original key
    const displayKey = sectionHeaders[key] || key;
    const formattedLine = `${displayKey} ${values.join(", ")}`;
    output += formattedLine + "\n";
  }

  return output.trim();
}



// function copyOutput() {
//   const outputElement = document.getElementById("output");
//   const textToCopy = outputElement.textContent;

//   if (navigator.clipboard) {
//     navigator.clipboard.writeText(textToCopy)
//       .then(() => {
//         alert("Copied to clipboard!");
//       })
//       .catch(err => {
//         console.error("Clipboard copy failed:", err);
//         alert("Failed to copy text.");
//       });
//   } else {
//     alert("Clipboard API not supported in this browser.");
//   }
// }


function copyOutput() {
  const text = document.getElementById("output").textContent;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand("copy");
    if (!successful) {
      alert("Failed to copy text.");
    }
  } catch (err) {
    alert("Failed to copy text.");
  }

  document.body.removeChild(textarea);
}


