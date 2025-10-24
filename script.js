
function clearTextarea() {
    document.getElementById("medicalInput").value = "";
}


function handleSubmit() {

    let dataDict = createDataDict()
    populateDataDict(dataDict)
    parseName(dataDict)
    parseAdmissionDate(dataDict)
    cleanChiefComplaint(dataDict)
    cleanInitialDiagnosis(dataDict)
    cleanProcedures(dataDict)
    parseMedicalHistorySection(dataDict)
    cleanDiseases(dataDict)
    flattenCleanedDiseases(dataDict)
    
    parseAge(dataDict)
    parseSex(dataDict)
    parseHeight(dataDict)
    parseWeight(dataDict)
    parseBMI(dataDict)
    parseTemp(dataDict)
    parseLabs(dataDict)
    parseGlucosePOC(dataDict)
    parseEKG(dataDict)
    
    calcCrCl(dataDict)
    
    let docDict = populateDocDict(dataDict)
    processDocDict(docDict)
    compileDocOutput(docDict)

    console.log(JSON.stringify(dataDict, null, 2))
    // document.getElementById("admit-and-history-output").textContent = JSON.stringify(dataDict, null, 2);

    // document.getElementById("output").textContent = sectionText;
    // document.getElementById("output").textContent = JSON.stringify(sections, null, 2);

}

function getFormattedDate() {
  const today = new Date();
  const month = today.getMonth() + 1; // Months are zero-indexed
  const day = today.getDate();
  const year = today.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
}



function createDataDict () {
  const dataDict = {
    
    name: {
      epicTitleText: 'EPIC Name:',
    },
    admitDate: {
      epicTitleText: 'EPIC Admission Date:',
    },
    cc: {
      epicTitleText: 'EPIC Chief Complaint:',
    },
    admitDx: {
      epicTitleText: 'EPIC Initial Diagnosis:',
    },
    procedures: {
      epicTitleText: 'EPIC Procedures:',
    },
    pmh: {
      epicTitleText: 'EPIC Past Medical History:',
    },
    age: {
      epicTitleText: 'EPIC Age:',
    },
    sex: {
      epicTitleText: 'EPIC Sex:',
    },
    height: {
      epicTitleText: 'EPIC Height:',
    },
    weight: {
      epicTitleText: 'EPIC Weight:',
    },
    bmi: {
      epicTitleText: 'EPIC BMI:',
    },
    temp: {
      epicTitleText: 'EPIC Temperature:',
    },
    k: {
      epicTitleText: 'EPIC Potassium:',
    },
    mg: {
      epicTitleText: 'EPIC Magnesium:',
    },
    scr: {
      epicTitleText: 'EPIC Creatinine:',
    },
    hgb: {
      epicTitleText: 'EPIC Hemoglobin:',
    },
    hct: {
      epicTitleText: 'EPIC Hematocrit:',
    },
    plt: {
      epicTitleText: 'EPIC Platelet:',
    },
    wbc: {
      epicTitleText: 'EPIC White Blood Cell:',
    },
    glucose: {
      epicTitleText: 'EPIC Glucose:',
    },
    glucosePOC: {
      epicTitleText: 'EPIC Glucose POC:',
    },
    ekg: {
      epicTitleText: 'EPIC EKG:',
    },
    crcl: {
      epicTitleText: 'EPIC Creatinine Clearance:',
    },
    ptaMeds: {
      epicTitleText: 'EPIC PTA Meds:',
    },
    ipScheduledMeds: {
      epicTitleText: 'EPIC Scheduled Meds:',
    },
    ipPrnMeds: {
      epicTitleText: 'EPIC PRN Meds:',
    },
    ipHemeMeds: {
      epicTitleText: 'EPIC Heme Meds:',
    },
    ipIdMeds: {
      epicTitleText: 'EPIC ID Meds:',
    },
    ipEndoMeds: {
      epicTitleText: 'EPIC Endo Meds:',
    },
  };
  
  return dataDict;
  
}





function populateDataDict(dataDict) {
  const inputText = document.getElementById("medicalInput").value;
  const lines = inputText.split(/\r?\n/);

  // Create a reverse lookup: epicTitleText -> key
  const titleToKeyMap = {};
  for (const key in dataDict) {
    titleToKeyMap[dataDict[key].epicTitleText] = key;
  }

  let currentKey = null;

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (titleToKeyMap.hasOwnProperty(trimmedLine)) {
      currentKey = titleToKeyMap[trimmedLine];
      dataDict[currentKey].rawContentArray = []; // Initialize rawContent array
      continue;
    }

    if (currentKey && trimmedLine !== "") {
      dataDict[currentKey].rawContentArray.push(trimmedLine);
    } else if (trimmedLine === "") {
      currentKey = null; // Stop collecting on empty line
    }
  }
}


function parseName(dataDict) {
    const rawArray = dataDict.name.rawContentArray;
    if (Array.isArray(rawArray) && rawArray.length > 0) {
        dataDict.name.cleanedContentArray = rawArray;
    }
}

function parseAdmissionDate(dataDict) {
    const admissionArray = dataDict.admitDate.rawContentArray;
    if (Array.isArray(admissionArray) && admissionArray.length > 0) {
        // const dateValue = admissionArray[0];
        dataDict.admitDate.cleanedContentArray = admissionArray;
    }
}

// function cleanChiefComplaint (dataDict) {
//   dataDict.cc.cleanedContentArray = dataDict.cc.rawContentArray;
// }

function cleanChiefComplaint(dataDict) {
  const rawArray = dataDict.cc.rawContentArray;

  if (rawArray.includes("No chief complaint on file.")) {
    dataDict.cc.cleanedContentArray = [];
  } else {
    dataDict.cc.cleanedContentArray = rawArray;
  }
}

// function cleanInitialDiagnosis(dataDict) {
//   const diagnosisArray = dataDict.admitDx.rawContentArray;

//   const cleanedArray = diagnosisArray.map(item =>
//     item
//       .replace(/\[.*?\]/g, "") // Remove text in square brackets
//       .replace(/\s*\(.*?\)\s*/g, "") // Remove text in parentheses
//       .replace(/\b, initial encounter\b/gi, "") // Remove "initial encounter", case-insensitive
//       .trim()
//   );

//   dataDict.admitDx.cleanedContentArray = cleanedArray;
// }


function cleanInitialDiagnosis(dataDict) {
  const diagnosisArray = dataDict.admitDx.rawContentArray;

  const cleanedArray = diagnosisArray.map(item =>
    item
      .replace(/\[.*?\]/g, "") // Remove text in square brackets
      .replace(/\s*\(.*?\)\s*/g, "") // Remove text in parentheses
      .replace(/\b, initial encounter\b/gi, "") // Remove "initial encounter", case-insensitive
      .replace(/\b, unspecified type\b/gi, "") // Remove "unspecified type", case-insensitive
      .trim()
  );

  dataDict.admitDx.cleanedContentArray = cleanedArray;
}


function cleanProcedures(dataDict) {
  const dataArray = dataDict.procedures.rawContentArray;
  const cleanedContentArray = [];

  // Check if the first line is "Procedure(s):"
  if (dataArray.length === 0 || dataArray[0].trim() !== "Procedure(s):") {
    dataDict.procedures.cleanedContentArray = [];
    return;
  }

  // Skip the first line and collect the rest
  for (let i = 1; i < dataArray.length; i++) {
    const line = dataArray[i].trim();
    if (line.length > 0) {
      cleanedContentArray.push(line.toLowerCase());
    }
  }

  dataDict.procedures.cleanedContentArray = cleanedContentArray;
}

// function parseMedicalHistorySection(dataDict) {
//     const lines = dataDict.pmh.rawContentArray;
//     const entries = [];
//     let i = 0;

//     while (i < lines.length) {
//         const line = lines[i].trim();
        
        
//         if (line.includes("Past Medical History:")) {
//           i++;
//           continue;
//         }


//         // Match lines with a colon separating date and disease
//         const match = line.match(/^([^:]+):\s*(.+)$/);
//         if (match) {
//             const date = match[1].trim();
//             const disease = match[2].trim();
//             let comment = null;

//             // Check next line for a comment
//             const nextLine = lines[i + 1] ? lines[i + 1].trim() : "";
//             const commentMatch = nextLine.match(/^Comment:\s*(.+)$/);
//             if (commentMatch) {
//                 comment = commentMatch[1].trim();
//                 i++; // Skip the comment line
//             }

//             entries.push({
//                 date,
//                 disease,
//                 comment
//             });
//         }

//         i++;
//     }

//     dataDict.pmh.pmhDict = entries;

// }


function parseMedicalHistorySection(dataDict) {
    const lines = dataDict.pmh.rawContentArray;
    const entries = [];
    let i = 0;

    // // Match either a date or "No date:"
    // const entryRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}|No date):\s*(.+)$/;
    
    // Match anything followed by a colon
    const entryRegex = /^([^:]+):\s*(.+)$/;

    while (i < lines.length) {
        let line = lines[i].trim();

        if (line.includes("Past Medical History:")) {
            i++;
            continue;
        }

        const match = line.match(entryRegex);
        if (match) {
            const date = match[1].trim();
            let disease = match[2].trim();
            let comment = null;

            i++;

            // Accumulate lines until next entry or comment
            while (i < lines.length) {
                const nextLine = lines[i].trim();

                // Check for comment
                const commentMatch = nextLine.match(/^Comment:\s*(.+)$/);
                if (commentMatch) {
                    comment = commentMatch[1].trim();
                    i++;
                    break;
                }

                // Check if next line starts a new entry
                if (entryRegex.test(nextLine)) {
                    break;
                }

                // Otherwise, it's part of the disease description
                disease += " " + nextLine;
                i++;
            }

            entries.push({ date, disease, comment });
        } else {
            i++;
        }
    }

    dataDict.pmh.pmhDict = entries;
}



function flattenCleanedDiseases(dataDict) {
    const historyArray = dataDict.pmh.pmhDict;
    if (!Array.isArray(historyArray)) return;

    // const cleanedList = historyArray
    //     .map(entry => entry.cleanedDisease)
    //     .filter(disease => typeof disease === "string" && disease.trim() !== "");
    
    const cleanedList = Array.from(new Set(
      historyArray
        .map(entry => entry.cleanedDisease)
        .filter(disease => typeof disease === "string" && disease.trim() !== "")
    ));


    dataDict.pmh.cleanedContentArray = cleanedList;
    // sections["Past Medical History:"] = cleanedList;
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



// function cleanDiseases(dataDict) {

//     const cleanedHistory = dataDict.pmh.pmhDict.map(entry => {
//         let cleanedDisease = entry.disease
//             .replace(/\s*\(.*?\)\s*/g, " ") // Remove parentheses and content
//             .trim();

//         // Handle comma: wrap text after comma in parentheses
//         const commaIndex = cleanedDisease.indexOf(",");
//         if (commaIndex !== -1) {
//             const beforeComma = cleanedDisease.slice(0, commaIndex).trim();
//             const afterComma = cleanedDisease.slice(commaIndex + 1).trim();
//             cleanedDisease = `${beforeComma} (${afterComma})`;
//         }

//         // If disease contains 'cancer' and there's a comment, append it in parentheses
//         if (cleanedDisease.toLowerCase().includes("cancer") && entry.comment) {
//             cleanedDisease += ` (${entry.comment.trim()})`;
//         }

//         return {
//             ...entry,
//             cleanedDisease
//         };
//     });

//     // Save the cleaned array back to the original object
//     dataDict.pmh.pmhDict = cleanedHistory;
// }



function cleanDiseases(dataDict) {
  const replaceDict = pmhReplaceDict();

  const cleanedHistory = dataDict.pmh.pmhDict.map(entry => {
    let diseaseText = entry.disease;

    // Step 1: Replace disease name if it matches any value in the dictionary
    for (const [key, values] of Object.entries(replaceDict)) {
      for (const value of values) {
        if (diseaseText.includes(value)) {
          diseaseText = key;
          break; // Stop checking once a match is found
        }
      }
    }

    // Step 2: Clean parentheses
    let cleanedDisease = diseaseText.replace(/\s*\(.*?\)\s*/g, " ").trim();

    // Step 3: Handle comma formatting
    const commaIndex = cleanedDisease.indexOf(",");
    if (commaIndex !== -1) {
      const beforeComma = cleanedDisease.slice(0, commaIndex).trim();
      const afterComma = cleanedDisease.slice(commaIndex + 1).trim();
      cleanedDisease = `${beforeComma} (${afterComma})`;
    }

    // Step 4: Append comment if disease contains 'cancer'
    if (cleanedDisease.toLowerCase().includes("cancer") && entry.comment) {
      cleanedDisease += ` (${entry.comment.trim()})`;
    }

    return {
      ...entry,
      cleanedDisease
    };
  });

  // Save the cleaned array back to the original object
  dataDict.pmh.pmhDict = cleanedHistory;
}


function parseAge(dataDict) {
  const ageArray = dataDict.age.rawContentArray;

  if (Array.isArray(ageArray) && ageArray.length > 0) {
    const ageString = ageArray[0];

    // Extract numeric value from the string
    const ageValue = parseInt(ageString.match(/\d+/)?.[0], 10);

    // Save as a single-item array
    dataDict.age.cleanedContentArray = [ageValue];
  }
}


function parseSex (dataDict) {
    const sexArray = dataDict.sex.rawContentArray;
    if (Array.isArray(sexArray) && sexArray.length > 0) {
        dataDict.sex.cleanedContentArray = sexArray;
    }
}


function parseHeight(dataDict) {
  const rawContentArray = dataDict.height.rawContentArray;

  if (Array.isArray(rawContentArray) && rawContentArray.length > 0) {
    const rawString = rawContentArray[1];

    // Extract the number inside the parentheses
    const match = rawString.match(/\(([\d.]+)\s*m\)/);

    if (match) {
      const heightValue = parseFloat(match[1]);
      dataDict.height.cleanedContentArray = [heightValue * 100];
    }
  }
}

function parseWeight(dataDict) {
  const rawContentArray = dataDict.weight.rawContentArray;

  if (Array.isArray(rawContentArray) && rawContentArray.length > 0) {
    const rawString = rawContentArray[1];

    // Extract the numeric value before "kg"
    const match = rawString.match(/([\d.]+)\s*kg/);

    if (match) {
      const weightValue = parseFloat(match[1]);
      dataDict.weight.cleanedContentArray = [weightValue];
    }
  }
}

function parseBMI(dataDict) {
  const rawContentArray = dataDict.bmi.rawContentArray;

  if (Array.isArray(rawContentArray) && rawContentArray.length > 0) {
    const rawString = rawContentArray[1];

    // Extract the numeric value before "kg"
    const match = rawString.match(/([\d.]+)\s*kg/);

    if (match) {
      const bmiValue = parseFloat(match[1]);
      dataDict.bmi.cleanedContentArray = [bmiValue]; // Use bmiValue, not bmi
    }
  }
}


function parseTemp(dataDict) {
  const rawContentArray = dataDict.temp.rawContentArray;
  const rawString = rawContentArray[0];

  // Use regex to extract the number after "Max:" and before "°F"
  const match = rawString.match(/Max:\s*([\d.]+)\s*°F/);
  
  // If a match is found, return the number as a float
  const maxTempF = match ? parseFloat(match[1]) : null;

  dataDict.temp.cleanedContentArray = [maxTempF]

}




function parseLabs(dataDict) {
  const labNames = ['k', 'mg', 'scr', 'hgb', 'hct', 'plt', 'wbc', 'glucose'];

  labNames.forEach(lab => {
    if (dataDict.hasOwnProperty(lab)) {
      const rawArray = dataDict[lab].rawContentArray;

      if (Array.isArray(rawArray) && rawArray.length > 0) {
        const rawValueString = rawArray[0].toLowerCase();

        if (rawValueString.includes('no results')) {
          dataDict[lab].cleanedContentArray = [];
        } else {
          // Extract numeric value after colon
          const match = rawValueString.match(/:\s*([\d.]+)/);
          if (match) {
            const value = parseFloat(match[1]);
            dataDict[lab].cleanedContentArray = [value];
          } else {
            // If no match, fallback to empty array or handle as needed
            dataDict[lab].cleanedContentArray = [];
          }
        }
      }
    }
  });
}


function parseGlucosePOC(dataDict) {
  const rawContentArray = dataDict.glucosePOC.rawContentArray;
  
    // Check for "No results available" message
  if (rawContentArray[0].includes("No results available")) {
    dataDict.glucosePOC.cleanedContentArray = [];
    return;
  }
  
  const rawString = rawContentArray[2];

  // Use regex to match all numeric values
  const cleanedContentArray = rawString.match(/\d+/g).map(Number);

  dataDict.glucosePOC.cleanedContentArray = cleanedContentArray;
}



function parseEKG(dataDict) {
  const rawContentArray = dataDict.ekg.rawContentArray;
  

  // Check for "No results" message
  const noResultsFound = rawContentArray.some(line =>
    line.includes("No results found for this or any previous visit")
  );

  if (noResultsFound) {
    dataDict.ekg.ekgDict = {};
    return;
  }


  const ekgValues = {
    ventricularRate: null,
    qrsInterval: null,
    qtInterval: null,
    qtc: null
  };

  rawContentArray.forEach(line => {
    if (line.includes("Ventricular Rate EKG/M")) {
      ekgValues.ventricularRate = parseInt(line.split(/\s+/).pop());
    } else if (line.includes("QRS-Interval (MSEC)")) {
      ekgValues.qrsInterval = parseInt(line.split(/\s+/).pop());
    } else if (line.includes("QT-Interval (MSEC)")) {
      ekgValues.qtInterval = parseInt(line.split(/\s+/).pop());
    } else if (line.includes("QTc")) {
      ekgValues.qtc = parseInt(line.split(/\s+/).pop());
    }
  });

  // Store the extracted values back into dataDict
  dataDict.ekg.ekgDict = ekgValues;
}


function calcIBW(dataDict) {
    const heightInches = dataDict.height.cleanedContentArray[0] / 2.54;
    const inchesOver60 = heightInches - 60;
    const ibwHeight = inchesOver60 > 0 ? inchesOver60 : 0;
    let ibw;

  
    if (dataDict.sex.cleanedContentArray[0] === 'female') {
        ibw = 45.5 + (2.3 * ibwHeight);
    } else {
        ibw = 50 + (2.3 * ibwHeight);
    }

    ibw = Math.round(ibw * 100) / 100;
    
    return ibw;
  }
  
  
  
function calcAdjBW(dataDict, ibw) {
    const tbw = dataDict.weight.cleanedContentArray[0];
    let adjBW = ibw + (0.4 * (tbw - ibw));

    adjBW = Math.round(adjBW * 100) / 100;
    
    return adjBW;
  
  }

function calcCrCl(dataDict) {
  const tbw = dataDict.weight.cleanedContentArray[0]; // total body weight
  const ibw = calcIBW(dataDict); // ideal body weight
  const adjBW = calcAdjBW(dataDict, ibw); // adjusted body weight
  const sex = dataDict.sex.cleanedContentArray[0]; 
  const age = dataDict.age.cleanedContentArray[0]; 
  const scr = dataDict.scr.cleanedContentArray[0]; 

  let calcWt = 0;

  if (tbw < ibw) {
    calcWt = tbw;
  } else if (tbw > (ibw * 1.2)) {
    calcWt = adjBW;
  } else {
    calcWt = ibw;
  }
  
  let crcl = ((140 - age) * calcWt) / (scr * 72);
  if (sex === 'female') {
    crcl = (crcl * 0.85);
  }
  
  crcl = Math.round(crcl * 10) / 10;
  
  if (crcl > 120) {
    crcl = 120;
  }

  
  // console.log(`tbw ${tbw}, ibw ${ibw}, adjBW ${adjBW}, scr ${scr}, calcWt ${calcWt}, crcl ${crcl}`)

  dataDict.crcl.cleanedContentArray = [crcl]

}


function constructRenalSection (dataDict) {
  const scr = dataDict.scr.cleanedContentArray[0];
  const crcl = dataDict.crcl.cleanedContentArray[0];
  let formattedString = ''
  const date = getFormattedDate();
  const name = dataDict.name.cleanedContentArray[0];
  
  if (crcl <= 30) {
    formattedString = `${date}: Scr ${scr} mg/dl, CrCl ${crcl} ml/min.  ***. ${name}`;
  } else {
    formattedString = `${date}: Scr ${scr} mg/dl, CrCl ${crcl} ml/min.  All meds renally appropriate. ${name}`;
  }
  
  return [formattedString];
}


function constructAnticoagSection (dataDict) {
  const hgb = dataDict.hgb.cleanedContentArray[0];
  const plt = dataDict.plt.cleanedContentArray[0];
  const bmi = dataDict.bmi.cleanedContentArray[0];
  const crcl = dataDict.crcl.cleanedContentArray[0];
  const date = getFormattedDate();
  const name = dataDict.name.cleanedContentArray[0];
  
  const formattedString = `${date}: Hgb ${hgb}, Plt ${plt}, BMI ${bmi}, CrCl ${crcl}.  On *** for ***VTE prophylaxis. ${name}`;
  
  return [formattedString];
}

function constructAntibioticSection (dataDict) {
  const date = getFormattedDate();
  const name = dataDict.name.cleanedContentArray[0];
  const wbc = dataDict.wbc.cleanedContentArray[0];
  const temp = dataDict.temp.cleanedContentArray[0];
  
  const formattedString = `${date}: ***, on ***.  WBC ${wbc}, Temp ${temp}, Cx ***. ${name}`;
  
  return [formattedString];
  
}


function constructInsulinSection (dataDict) {
  const date = getFormattedDate();
  const name = dataDict.name.cleanedContentArray[0];
  const glucose = dataDict.glucose.cleanedContentArray;
  const glucosePOC = dataDict.glucosePOC.cleanedContentArray;
  let formattedString = ""
  
  // Combine the arrays
  const combinedGlucose = [...glucose, ...glucosePOC];
  
  if (combinedGlucose.length === 1) {
    
    formattedString = `${date}: Glucose ${combinedGlucose[0]}.  On ***. ${name}`;
    
  } else {

    // Find min and max
    const minGlucose = Math.min(...combinedGlucose);
    const maxGlucose = Math.max(...combinedGlucose);
    
    formattedString = `${date}: Glucose ${minGlucose}-${maxGlucose}.  On ***. ${name}`;

  }
  
  return [formattedString];
  
}

// function constructAntiarrhythmicSection (dataDict) {
//   const ekgDict = dataDict.ekg.ekgDict;
//   const kValue = dataDict.k.cleanedContentArray[0];
//   const mgValue = dataDict.mg.cleanedContentArray[0];
  
//   if (ekgDict and kValue and mgValue) {
//     const vRate = ekgDict["ventricularRate"];
//     const qrs = ekgDict["qrsInterval"];
//     const qt = ekgDict["qtInterval"];
//     const qtc = ekgDict["qtc"];
//     formattedString = `${date}: V-Rate ${vRate}, QRS ${qrs}, QT ${qt}, QTc ${qtc}, K ${kValue}, Mg ${mgValue}.  On ***. ${name}`;
    
//   } else {
    
//     formattedString = `${date}: Glucose ${minGlucose}-${maxGlucose}.  On ***. ${name}`;
//   }
// }

function constructAntiarrhythmicSection(dataDict) {
  const date = getFormattedDate();
  const name = dataDict.name.cleanedContentArray[0];
  const ekgDict = dataDict.ekg.ekgDict;
  const kValue = dataDict.k?.cleanedContentArray?.[0];
  const mgValue = dataDict.mg?.cleanedContentArray?.[0];
  // const date = dataDict.date || "Date"; // Replace with actual date logic
  // const name = dataDict.name || "Name"; // Replace with actual name logic

  let formattedString = `${date}: `;
  const ekgParts = [];
  
  if (kValue !== null && kValue !== undefined) {
    ekgParts.push(`K ${kValue}`);
  }
  if (mgValue !== null && mgValue !== undefined) {
    ekgParts.push(`Mg ${mgValue}`);
  }
  
  
  if (ekgDict) {
    const { ventricularRate, qrsInterval, qtInterval, qtc } = ekgDict;

    if (ventricularRate !== null && ventricularRate !== undefined) {
      ekgParts.push(`V-Rate ${ventricularRate}`);
    }
    if (qrsInterval !== null && qrsInterval !== undefined) {
      ekgParts.push(`QRS ${qrsInterval}`);
    }
    if (qtInterval !== null && qtInterval !== undefined) {
      ekgParts.push(`QT ${qtInterval}`);
    }
    if (qtc !== null && qtc !== undefined) {
      ekgParts.push(`QTc ${qtc}`);
    }
  }
  
  formattedString += ekgParts.join(", ") + `. On ***. ${name}`;

  return [formattedString];
}

function constructAnticonvulsantSection (dataDict) {
    const date = getFormattedDate();
    const name = dataDict.name.cleanedContentArray[0];
    const hgb = dataDict.hgb.cleanedContentArray[0];
    const hct = dataDict.hct.cleanedContentArray[0];
    const plt = dataDict.plt.cleanedContentArray[0];
    const crcl = dataDict.crcl.cleanedContentArray[0];

    
    const formattedString = `${date}: Hgb ${hgb}, Hct ${hct}, Plt ${plt}, CrCl ${crcl}.  On ***. ${name}`;
    
    return [formattedString];
}



function constructAdmitAndHistorySection(dataDict) {
  const sections = {
    "Admit": dataDict.admitDate.cleanedContentArray,
    "CC": dataDict.cc.cleanedContentArray,
    "Dx": dataDict.admitDx.cleanedContentArray,
    "Sx": dataDict.procedures.cleanedContentArray,
    "PMH": dataDict.pmh.cleanedContentArray,
  };

  const joinedSections = {};
  const outputLines = [];

  for (const [key, array] of Object.entries(sections)) {
    const joined = array.join(", ");
    joinedSections[key] = joined;

    // Only include non-empty values in the final output
    if (joined.length > 0) {
      outputLines.push(`${key}: ${joined}`);
    }
  }

  const summaryString = outputLines.join("\n");
  return summaryString;
  
}


function populateDocDict (dataDict) {
  const docDict = {
    admitHx: {
      webId: 'admit-and-history-output',
      subsections: {
        admitDate: {
          title: '',
          value: constructAdmitAndHistorySection(dataDict),
        },
      },
    },
    
    renal: {
      webId: 'crcl-output',
      subsections: {
        renalReview: {
          title: '',
          value: constructRenalSection(dataDict),
        },
      },
    },
    
    anticoag: {
      webId: 'anticoag-output',
      subsections: {
        anticoagReview: {
          title: '',
          value: constructAnticoagSection(dataDict),
        },
      },
    },
    
    antiarrhythmic: {
      webId: 'antiarrhythmic-output',
      subsections: {
        anticoagReview: {
          title: '',
          value: constructAntiarrhythmicSection(dataDict),
        },
      },
    },
    
    antibiotic: {
      webId: 'antibiotic-output',
      subsections: {
        anticoagReview: {
          title: '',
          value: constructAntibioticSection(dataDict),
        },
      },
    },
    
    insulin: {
      webId: 'insulin-output',
      subsections: {
        anticoagReview: {
          title: '',
          value: constructInsulinSection(dataDict),
        },
      },
    },

    anticonvulsant: {
      webId: 'anticonvulsant-output',
      subsections: {
        anticoagReview: {
          title: '',
          value: constructAnticonvulsantSection(dataDict),
        },
      },
    },
    
    
  }
  
  return docDict;
}


// function processDocDict(docDict) {
//   for (const sectionKey in docDict) {
//     const section = docDict[sectionKey];
//     const webId = section.webId;

//     for (const subKey in section.subsections) {
//       const subsection = section.subsections[subKey];
//       const title = subsection.title;
//       let value = subsection.value;

//       // Join array values with commas if it's an array
//       if (Array.isArray(value)) {
//         value = value.join(', ');
//       }
      

//       // Save the output back into docDict under the subsection
//       docDict[sectionKey].subsections[subKey]['output'] = title + value;
      
//     }
    
//   }
// }

function processDocDict(docDict) {
  for (const sectionKey in docDict) {
    const section = docDict[sectionKey];
    const webId = section.webId;

    for (const subKey in section.subsections) {
      const subsection = section.subsections[subKey];
      const title = subsection.title;
      let value = subsection.value;

      // Check if value is an array and handle based on its length
      if (Array.isArray(value)) {
        if (value.length === 1) {
          value = value[0]; // Single item
        } else if (value.length > 1) {
          value = value.join(', '); // Multiple items
        } else {
          value = ''; // Empty array
        }
      }

      // Save the output back into docDict under the subsection
      docDict[sectionKey].subsections[subKey]['output'] = title + value;
    }
  }
}




function compileDocOutput(docDict) {
  for (const sectionKey in docDict) {
    const section = docDict[sectionKey];
    const webId = section.webId;
    let compiledText = '';

    if (section.subsections) {
      for (const subKey in section.subsections) {
        const subsection = section.subsections[subKey];

        if (subsection.output) {
          compiledText += subsection.output + '\n';
        }
      }
    }

    // Update the corresponding HTML element once per section
    const targetElement = document.getElementById(webId);
    if (targetElement) {
      targetElement.innerText = compiledText.trim(); // innerText preserves line breaks
    } else {
      console.warn(`Element with ID '${webId}' not found.`);
    }
  }
}


function copyOutput(webId) {
  const element = document.getElementById(webId);

  if (!element) {
    console.warn(`Element with ID '${webId}' not found.`);
    return;
  }

  const text = element.innerText.trim();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
