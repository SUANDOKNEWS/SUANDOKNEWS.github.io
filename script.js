
// ตัวแปรเก็บคะแนนของแต่ละหมวด
let scores = {
    respiratory: 0,
    oxygen: 0,
    supp_oxygen: 0,
    temperature: 0,
    bp: 0,
    heart_rate: 0,
    avpu: 0
};

// ฟังก์ชันเลือกตัวเลือกและกำหนดคะแนน
function selectOption(category, value, button) {
    // ลบคลาส selected จากทุกปุ่มในหมวดเดียวกัน
    let buttons = document.getElementById(category).getElementsByTagName("button");
    for (let btn of buttons) {
        btn.classList.remove("selected");
    }

    // กำหนดคะแนนและเพิ่มคลาส selected ให้ปุ่มที่เลือก
    scores[category] = value;
    button.classList.add("selected");

    // อัพเดทคะแนนรวม
    updateScore();
}

// ฟังก์ชันตรวจสอบว่ามีคะแนน 3 ในหมวดใดบ้าง
function checkRedScores() {
    let redCategories = [];
    for (let category in scores) {
        if (scores[category] === 3) {
            redCategories.push(category);
        }
    }
    return redCategories;
}

// ฟังก์ชันแปลง category เป็นข้อความภาษาไทย
function getCategoryName(category) {
    const categoryNames = {
        'respiratory': 'อัตราการหายใจ',
        'oxygen': 'ความอิ่มตัวของออกซิเจน',
        'supp_oxygen': 'การใช้ออกซิเจนเสริม',
        'temperature': 'อุณหภูมิ',
        'bp': 'ความดันโลหิต',
        'heart_rate': 'อัตราการเต้นของหัวใจ',
        'avpu': 'ระดับความรู้สึกตัว'
    };
    return categoryNames[category] || category;
}

// ฟังก์ชันบันทึกสถิติ
function saveStatistics() {
    const hnValue = document.getElementById("hnInput").value;
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const currentDate = new Date();
    const timeString = currentDate.toLocaleString('th-TH');
    
    const stats = {
        hn: hnValue,
        score: totalScore,
        time: timeString,
        id: Date.now() // เพิ่ม ID ที่ไม่ซ้ำกันสำหรับการลบข้อมูล
    };

    // เพิ่มสถิติเข้าไปใน localStorage
    let allStats = JSON.parse(localStorage.getItem("statistics")) || [];
    allStats.push(stats);
    localStorage.setItem("statistics", JSON.stringify(allStats));
    
    console.log("Statistics saved:", stats);
    
    // อัพเดทตารางสถิติ
    updateStatisticsTable();
}

// ฟังก์ชันลบรายการสถิติ
function deleteStatistic(id) {
    let allStats = JSON.parse(localStorage.getItem("statistics")) || [];
    allStats = allStats.filter(stat => stat.id !== id);
    localStorage.setItem("statistics", JSON.stringify(allStats));
    
    // อัพเดทตารางสถิติ
    updateStatisticsTable();
}

// ฟังก์ชันแสดงตารางสถิติ
function updateStatisticsTable() {
    const tableBody = document.getElementById("statisticsBody");
    const allStats = JSON.parse(localStorage.getItem("statistics")) || [];
    
    // ล้างข้อมูลเก่าในตาราง
    tableBody.innerHTML = "";
    
    // เพิ่มข้อมูลใหม่ในตาราง
    allStats.forEach(stat => {
        const row = document.createElement("tr");
        
        const hnCell = document.createElement("td");
        hnCell.textContent = stat.hn || "-";
        
        const scoreCell = document.createElement("td");
        scoreCell.textContent = stat.score;
        
        const timeCell = document.createElement("td");
        timeCell.textContent = stat.time || "-";
        
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "✕";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = function() {
            deleteStatistic(stat.id);
        };
        deleteCell.appendChild(deleteButton);
        
        row.appendChild(hnCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
        row.appendChild(deleteCell);
        
        tableBody.appendChild(row);
    });
}

// เพิ่มปุ่มบันทึกคะแนน
function addSubmitButton() {
    const buttonContainer = document.querySelector('.button-container');
    
    // สร้างปุ่มบันทึกและวางในตำแหน่งที่เหมาะสม
    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'บันทึกคะแนน';
    submitButton.onclick = saveStatistics;
    
    // เพิ่มปุ่มไว้ด้านหน้าของปุ่มรีเซ็ต
    buttonContainer.insertBefore(submitButton, buttonContainer.firstChild);
}

// ฟังก์ชันคำนวณคะแนนรวม
function updateScore() {
    // รวมคะแนนทั้งหมด
    let totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    document.getElementById("totalScore").innerText = totalScore;

    // เก็บข้อมูลว่าคะแนนมีการเปลี่ยนแปลง
    scoreUpdated = true;

    // ตรวจสอบ RED score
    let redCategories = checkRedScores();

    // แสดงคำแนะนำตามระดับคะแนน
    updateAdvice(totalScore, redCategories);
}

// ฟังก์ชันแสดงคำแนะนำตามระดับคะแนน
function updateAdvice(score, redCategories) {
    let advice = "";
    let hasRedScore = redCategories.length > 0;

    // สร้างข้อความแสดงรายการหมวดที่ได้คะแนน 3
    let redScoreText = "";
    if (hasRedScore) {
        redScoreText = "<div class='red-score-alert'>⚠️ พบ RED score ในหมวด: ";
        redScoreText += redCategories.map(cat => getCategoryName(cat)).join(", ");
        redScoreText += "<br>ต้องให้การติดตามอาการอย่างใกล้ชิด เนื่องจากผู้ป่วยมีอาการเปลี่ยนแปลงมาก</div>";
    }

    // เปลี่ยนสีของคะแนนรวมตามระดับคะแนน
    const totalScoreElement = document.getElementById("totalScore");

    if (score === 0) {
        totalScoreElement.style.color = "#2e7d32"; // สีเขียว
    } else if (score >= 1 && score <= 4) {
        totalScoreElement.style.color = "#2e7d32"; // สีเขียว
    } else if (score >= 5 && score <= 6) {
        totalScoreElement.style.color = "#ff8f00"; // สีส้ม
    } else if (score >= 7) {
        totalScoreElement.style.color = "#c53030"; // สีแดง
    }

    if (score >= 0 && score <= 4) {
        advice = "คะแนนต่ำ : ให้การพยาบาล Basic ตรวจสอบอาการทั่วไป";
        document.getElementById("advice").style.color = hasRedScore ? "#c53030" : "#2e7d32"; // สีแดงเข้มหรือเขียว
    } else if (score >= 5 && score <= 6) {
        advice = "คะแนนปานกลาง : เร่งด่วน แจ้งพยาบาลเพื่อประเมินอาการซ้ำเพื่อให้การพยาบาลได้อย่างทันท่วงที";
        document.getElementById("advice").style.color = "#ff8f00"; // สีส้ม
    } else if (score >= 7) {
        advice = "คะแนนสูง : ฉุกเฉิน แจ้งทีมแพทย์เพื่อส่งต่อผู้ป่วยให้ได้รับการดูแลขั้นวิกฤต";
        document.getElementById("advice").style.color = "#c53030"; // สีแดง
    }

    document.getElementById("advice").innerHTML = advice + (hasRedScore ? "<br><br>" + redScoreText : "");
}

// ฟังก์ชันรีเซ็ตคะแนนทั้งหมด
function resetScores() {
    // รีเซ็ตคะแนนทุกหมวด
    scores = {
        respiratory: 0,
        oxygen: 0,
        supp_oxygen: 0,
        temperature: 0,
        bp: 0,
        heart_rate: 0,
        avpu: 0
    };

    // ลบ class selected จากทุกปุ่ม
    const allButtons = document.querySelectorAll('.options button');
    allButtons.forEach(button => {
        button.classList.remove('selected');
    });

    // อัพเดทคะแนนรวม
    updateScore();
    
    // ล้างข้อความคำแนะนำ
    document.getElementById('advice').innerHTML = '';
}

// เพิ่ม DOMContentLoaded เพื่อให้แน่ใจว่าสคริปต์ทำงานหลังจาก DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    
    // เพิ่มปุ่มบันทึกคะแนน
    addSubmitButton();
    
    // โหลดตารางสถิติ
    updateStatisticsTable();
});
