// Global variables to store selected values
let scores = {
  respiratory: null,
  oxygen: null,
  supp_oxygen: null,
  temperature: null,
  bp: null,
  heart_rate: null,
  avpu: null
};

let selectedValues = {
  gender: null,
  age: null,
  referral: null
};

// Function to handle option selection for scoring parameters
function selectOption(category, score, button) {
  // Remove active class from all buttons in this category
  const categoryButtons = document.querySelectorAll(`#${category} button`);
  categoryButtons.forEach(btn => btn.classList.remove('active'));

  // Add active class to selected button
  button.classList.add('active');

  // Store the score
  if (category === 'gender' || category === 'age' || category === 'referral') {
      selectedValues[category] = button.textContent.trim();
  } else {
      scores[category] = score;
  }

  // Update total score
  updateTotalScore();
}

// Function to handle oxygen scale selection
function selectOxygenOption(scale, score, button) {
  // Remove active class from all oxygen buttons
  const allOxygenButtons = document.querySelectorAll('#oxygen_scale1 button, #oxygen_scale2 button');
  allOxygenButtons.forEach(btn => btn.classList.remove('active'));

  // Add active class to selected button
  button.classList.add('active');

  // Store the score for oxygen
  scores.oxygen = score;

  // Update total score
  updateTotalScore();
}

// Function to calculate and update total score
function updateTotalScore() {
  let total = 0;
  let hasRedScore = false;

  // Calculate total from all scores
  Object.values(scores).forEach(score => {
      if (score !== null) {
          total += score;
          if (score === 3) {
              hasRedScore = true;
          }
      }
  });

  // Update total score display
  const totalScoreElement = document.getElementById('totalScore');
  totalScoreElement.textContent = total;

  // Update total score color based on score range
  totalScoreElement.className = '';
  if (hasRedScore) {
      totalScoreElement.classList.add('red-score');
  } else if (total >= 7) {
      totalScoreElement.classList.add('red-score');
  } else if (total >= 5 && total <= 6) {
      totalScoreElement.classList.add('yellow-score');
  } else if (total >= 3 && total <= 4) {
      totalScoreElement.classList.add('yellow-score');
  } else if (total >= 0 && total <= 2) {
      totalScoreElement.classList.add('green-score');
  }

  // Always update advice, even if form is not complete
  updateAdvice(total, hasRedScore);

  // Enable/disable save button based on completion
  const saveButton = document.getElementById('saveButton');
  if (saveButton) {
      saveButton.disabled = !isFormComplete();
      saveButton.style.opacity = isFormComplete() ? '1' : '0.5';
  }
}

// Function to update advice based on total score
function updateAdvice(total, hasRedScore) {
  const adviceElement = document.getElementById('advice');
  const nursingCareElement = document.getElementById('nursingCareAdvice');
  let advice = '';
  let className = '';
  let nursingCare = '';

  if (hasRedScore) {
      advice = 'ตรวจพบ RED Score คะแนนแดง - ผู้ป่วยอาจมีอาการเปลี่ยนแปลงต้องได้รับการดูแลอย่างใกล้ชิด';
      className = 'red-alert';
      nursingCare = `
          <h4>⚠️ กรณีพบ RED Score คะแนนแดง (คะแนนข้อใดข้อหนึ่ง +3)</h4>
          <p><strong>ผู้ป่วยอาจมีอาการเปลี่ยนแปลงต้องได้รับการดูแลอย่างใกล้ชิด</strong></p>
          <p>- เฝ้าระวังอาการเปลี่ยนแปลงของผู้ป่วยอย่างใกล้ชิด</p>
          <p>- ประสานงานแจ้งโรงพยาบาลเพื่อเตรียมความพร้อม</p>
          <p>- พิจารณาส่งโรงพยาบาลภายในระยะเวลา 8 นาที</p>
      `;
  } else if (total >= 7) {
      advice = 'คะแนนสูง - Emergent ฉุกเฉิน';
      className = 'high-score';
      nursingCare = `
          <h4>คะแนนสูง (7 ขึ้นไป): Emergent ฉุกเฉิน</h4>
          <p>- เฝ้าระวังอาการเปลี่ยนแปลงของผู้ป่วยอย่างใกล้ชิด</p>
          <p>- ประสานงานแจ้งโรงพยาบาลเพื่อเตรียมความพร้อม</p>
          <p>- พิจารณาส่งโรงพยาบาลภายในระยะเวลา 8 นาที</p>
      `;
  } else if (total >= 5) {
      advice = 'คะแนนปานกลาง - Urgent เร่งด่วน';
      className = 'medium-score';
      nursingCare = `
          <h4>คะแนนปานกลาง (5-6): Urgent เร่งด่วน</h4>
          <p>- เฝ้าระวังอาการเปลี่ยนแปลงของผู้ป่วยอย่างใกล้ชิด</p>
          <p>- ประสานงานแจ้งโรงพยาบาลเพื่อเตรียมความพร้อม</p>
          <p>- พิจารณาส่งโรงพยาบาลภายในระยะเวลา 8-15 นาที</p>
      `;
  } else if (total >= 3) {
      advice = 'คะแนนต่ำ-ปานกลาง - Less Urgent เร่งด่วนน้อย';
      className = 'low-medium-score';
      nursingCare = `
          <h4>คะแนนต่ำ - ปานกลาง (3-4): Less Urgent เร่งด่วนน้อย</h4>
          <p>- ประสานงานแจ้งโรงพยาบาลเพื่อเตรียมความพร้อม</p>
          <p>- เฝ้าระวังอาการเปลี่ยนแปลง</p>
          <p>- พิจารณาส่งโรงพยาบาลภายในระยะเวลา 15 นาที</p>
      `;
  } else if (total >= 1) {
      advice = 'คะแนนต่ำ - Non Urgent ไม่เร่งด่วน';
      className = 'low-score';
      nursingCare = `
          <h4>คะแนนต่ำ (1-2): Non Urgent ไม่เร่งด่วน</h4>
          <p>- แนะนำขั้นตอนการปฏิบัติตัวเบื้องต้นแก่ผู้ป่วย</p>
          <p>- ติดตามอาการตามปกติ</p>
          <p>- พิจารณาส่งต่อโรงพยาบาลตามสิทธิการรักษา</p>
      `;
  } else if (total === 0) {
      advice = 'คะแนนต่ำ - Non Urgent ไม่เร่งด่วน';
      className = 'low-score';
      nursingCare = `
          <h4>คะแนนต่ำ (0): Non Urgent ไม่เร่งด่วน</h4>
          <p><strong>ไม่มีความเสี่ยงในปัจจุบัน แต่ควรติดตามอาการต่อไป</strong></p>
          <p>- แนะนำขั้นตอนการปฏิบัติตัวเบื้องต้นแก่ผู้ป่วย</p>
          <p>- ติดตามอาการตามปกติ</p>
          <p>- พิจารณาส่งต่อโรงพยาบาลตามสิทธิการรักษา</p>
      `;
  } else {
      advice = 'กรุณาเลือกข้อมูลเพื่อประเมินคะแนน';
      className = 'low-score';
      nursingCare = `
          <h4>กรุณาเลือกข้อมูลเพื่อประเมินคะแนน</h4>
          <p>- เลือกตัวเลือกในแต่ละหมวดเพื่อดูคำแนะนำการพยาบาล</p>
      `;
  }

  adviceElement.textContent = advice;
  adviceElement.className = className;

  // Update nursing care advice
  if (nursingCareElement) {
      nursingCareElement.innerHTML = nursingCare;
      nursingCareElement.className = 'nursing-care-advice ' + className;
  }
}

// Function to reset all scores
function resetScores() {
  // Reset all scores
  scores = {
      respiratory: null,
      oxygen: null,
      supp_oxygen: null,
      temperature: null,
      bp: null,
      heart_rate: null,
      avpu: null
  };

  // Reset selected values
  selectedValues = {
      gender: null,
      age: null,
      referral: null
  };

  // Remove active class from all buttons
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
      if (button.id !== 'resetButton') {
          button.classList.remove('active');
      }
  });

  // Reset total score display
  document.getElementById('totalScore').textContent = '0';

  // Reset advice
  const adviceElement = document.getElementById('advice');
  adviceElement.textContent = '';
  adviceElement.className = '';
}

// Function to check if all required fields are completed
function isFormComplete() {
  // Check gender and age
  if (!selectedValues.gender || !selectedValues.age) {
      return false;
  }

  // Check all scoring parameters are selected
  const requiredScores = ['respiratory', 'oxygen', 'supp_oxygen', 'temperature', 'bp', 'heart_rate', 'avpu'];
  for (let category of requiredScores) {
      if (scores[category] === null) {
          return false;
      }
  }

  // Check if referral is selected (always required now)
  if (!selectedValues.referral) {
      return false;
  }

  return true;
}

// Function to save data to statistics table
function saveToStatistics() {
  // Check if all required fields are completed
  if (!isFormComplete()) {
      alert('กรุณาเลือกให้ครบทุกข้อก่อนบันทึกข้อมูล (เพศ, อายุ, การประเมินทุกข้อ และส่งต่อ)');
      return;
  }

  // Calculate total score
  let total = 0;
  let hasRedScore = false;
  Object.values(scores).forEach(score => {
      if (score !== null) {
          total += score;
          if (score === 3) {
              hasRedScore = true;
          }
      }
  });

  // Send data to Google Form
  sendToGoogleForm(total, hasRedScore);

  // Get current date and time
  const now = new Date();
  const dateTime = now.toLocaleString('th-TH');

  // Add row to statistics table
  const tableBody = document.getElementById('statisticsBody');
  const newRow = tableBody.insertRow(0);

  // Add cells with data
  newRow.insertCell(0).textContent = selectedValues.gender;
  newRow.insertCell(1).textContent = selectedValues.age;
  newRow.insertCell(2).textContent = total;
  newRow.insertCell(3).textContent = selectedValues.referral || '-';
  newRow.insertCell(4).textContent = dateTime;

   // Add delete button cell
   const deleteCell = newRow.insertCell(5);
   const deleteButton = document.createElement('button');
   deleteButton.innerHTML = '✕';
   deleteButton.className = 'delete-btn';
   deleteButton.title = 'ลบรายการนี้';
   deleteButton.onclick = function() {
       deleteRecord(newRow);
   };
   deleteCell.appendChild(deleteButton);

  // Optional: Save to localStorage for persistence
  saveToLocalStorage();

  // Show success message
  alert('บันทึกข้อมูลเรียบร้อยแล้ว');
}

// Function to save data to localStorage
function saveToLocalStorage() {
  const data = {
      gender: selectedValues.gender,
      age: selectedValues.age,
      referral: selectedValues.referral,
      scores: scores,
      totalScore: Object.values(scores).reduce((sum, score) => sum + (score || 0), 0),
      timestamp: new Date().toISOString(),
      id: Date.now() // Add unique ID for deletion
  };

  // Get existing data
  let savedData = JSON.parse(localStorage.getItem('newsStatistics') || '[]');

  // Add new data
  savedData.unshift(data);

  // Keep only last 50 records
  if (savedData.length > 50) {
      savedData = savedData.slice(0, 50);
  }

  // Save back to localStorage
  localStorage.setItem('newsStatistics', JSON.stringify(savedData));
}

// Function to send data to Google Form
function sendToGoogleForm(totalScore, hasRedScore) {
  // Google Form URL - อัปเดตแล้วด้วย Form ID จริงของคุณ
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1yjBSVf-JCIVtKDr_sr4_Khh9f9Kg2lhBWDqdD7ZOzIk/formResponse';

  // สร้าง FormData สำหรับส่งข้อมูล
  const formData = new FormData();

  // เพิ่มข้อมูลลงใน FormData (ใช้ entry field จริงจาก Google Form ของคุณ)
  formData.append('entry.453445348', selectedValues.gender || ''); // เพศ
  formData.append('entry.804811008', selectedValues.age || ''); // อายุ  
  formData.append('entry.1483682713', totalScore); // คะแนนรวม
  formData.append('entry.1859376595', selectedValues.referral || ''); // ส่งต่อ
  formData.append('entry.1933464715', new Date().toLocaleString('th-TH')); // วันที่เวลา

  // ส่งข้อมูลไป Google Form
  fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    body: formData,
    mode: 'no-cors' // จำเป็นสำหรับ Google Forms
  })
  .then(() => {
    console.log('ส่งข้อมูลไป Google Form สำเร็จ');
  })
  .catch((error) => {
    console.error('เกิดข้อผิดพลาดในการส่งข้อมูลไป Google Form:', error);
  });
}

// Function to load data from localStorage on page load
function loadFromLocalStorage() {
  const savedData = JSON.parse(localStorage.getItem('newsStatistics') || '[]');
  const tableBody = document.getElementById('statisticsBody');

  savedData.forEach((record, index) => {
      const newRow = tableBody.insertRow();
      newRow.insertCell(0).textContent = record.gender;
      newRow.insertCell(1).textContent = record.age;
      newRow.insertCell(2).textContent = record.totalScore;
      newRow.insertCell(3).textContent = record.referral || '-';
      newRow.insertCell(4).textContent = new Date(record.timestamp).toLocaleString('th-TH');

       // Add delete button cell
       const deleteCell = newRow.insertCell(5);
       const deleteButton = document.createElement('button');
       deleteButton.innerHTML = '✕';
       deleteButton.className = 'delete-btn';
       deleteButton.title = 'ลบรายการนี้';
       deleteButton.onclick = function() {
           deleteRecord(newRow, record.id || index);
       };
       deleteCell.appendChild(deleteButton);
  });
}

// Function to delete a record
function deleteRecord(row, recordId) {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
        // Remove from table
        row.remove();

        // Remove from localStorage if recordId is provided
        if (recordId !== undefined) {
            let savedData = JSON.parse(localStorage.getItem('newsStatistics') || '[]');

            // Filter out the record to delete
            if (typeof recordId === 'number' && recordId > 1000000000000) {
                // Delete by ID (for newer records)
                savedData = savedData.filter(record => record.id !== recordId);
            } else {
                // Delete by index (for older records without ID)
                savedData.splice(recordId, 1);
            }

            // Save back to localStorage
            localStorage.setItem('newsStatistics', JSON.stringify(savedData));
        }
    }
}

// Add save button functionality
document.addEventListener('DOMContentLoaded', function() {
  // Load saved data when page loads
  loadFromLocalStorage();

  // Add save button if it doesn't exist
  const buttonContainer = document.querySelector('.button-container');
  if (buttonContainer && !document.getElementById('saveButton')) {
      const saveButton = document.createElement('button');
      saveButton.id = 'saveButton';
      saveButton.textContent = 'บันทึกข้อมูล';
      saveButton.onclick = saveToStatistics;
      saveButton.disabled = true;
      saveButton.style.opacity = '0.5';
      buttonContainer.appendChild(saveButton);
  }
});

// Legacy functions for backwards compatibility
function checkVital(id, min, max) {
  const input = document.getElementById(id);
  const value = parseFloat(input.value);
  const button = input.nextElementSibling.nextElementSibling;

  if (value >= min && value <= max) {
      button.style.backgroundColor = 'pink';
  } else {
      button.style.backgroundColor = 'red';
  }
}

function checkBP() {
  const input = document.getElementById('bp');
  const values = input.value.split('/');
  const button = input.nextElementSibling.nextElementSibling;

  if (values.length === 2) {
      const systolic = parseInt(values[0]);
      const diastolic = parseInt(values[1]);

      if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) {
          button.style.backgroundColor = 'pink';
      } else {
          button.style.backgroundColor = 'red';
      }
  }
}
