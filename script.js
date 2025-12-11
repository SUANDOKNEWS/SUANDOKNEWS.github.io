// SUANDOK NEWS - National Early Warning Score Script
// Modern, Enhanced Version (v5.0 - Correct Entry IDs)

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

// ตัวแปรเก็บว่าเลือก scale ไหนอยู่
let selectedOxygenScale = null;

// ฟังก์ชันเลือกตัวเลือกและกำหนดคะแนน (พร้อม Toggle Selection)
function selectOption(category, value, button) {
    const isSelected = button.classList.contains("selected");
    const buttons = document.getElementById(category).getElementsByTagName("button");
    
    for (let btn of buttons) {
        btn.classList.remove("selected");
    }

    if (isSelected) {
        scores[category] = 0;
    } else {
        scores[category] = value;
        button.classList.add("selected");
        
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    updateScore();
}

// ฟังก์ชันเฉพาะสำหรับเลือกค่าออกซิเจน (พร้อม Toggle Selection)
function selectOxygenOption(scale, value, button) {
    const isSelected = button.classList.contains("selected");
    const scale1Buttons = document.getElementById('oxygen_scale1').getElementsByTagName("button");
    const scale2Buttons = document.getElementById('oxygen_scale2').getElementsByTagName("button");
    
    for (let btn of scale1Buttons) {
        btn.classList.remove("selected");
    }
    for (let btn of scale2Buttons) {
        btn.classList.remove("selected");
    }

    if (isSelected) {
        scores.oxygen = 0;
        selectedOxygenScale = null;
    } else {
        scores.oxygen = value;
        button.classList.add("selected");
        selectedOxygenScale = scale;

        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

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

// --- START: GOOGLE FORM INTEGRATION (FIXED IDs) ---

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdyP7JCRiBGqfdhUTVAcWXwZYjw5g_YkmAay1WgRL-WNRuOTA/formResponse";

// แก้ไขรหัส Entry ID ให้ถูกต้องตาม Source Code ของ Google Form
const GOOGLE_FORM_ENTRY_MAP = {
    location: "entry.1979543809", // รหัสที่ถูกต้องสำหรับ "สถานที่ที่ประเมิน"
    hn: "entry.2024629124",       // รหัสที่ถูกต้องสำหรับ "Hospital Number"
    score: "entry.1011439454",    // รหัสที่ถูกต้องสำหรับ "คะแนนรวม NEWs"
    time: "entry.794074384"       // รหัสที่ถูกต้องสำหรับ "เวลาที่ประเมิน"
};

/**
 * ฟังก์ชันส่งข้อมูลโดยใช้ Hidden Iframe
 */
function sendToGoogleForm(stats) {
    return new Promise((resolve, reject) => {
        try {
            // 1. สร้าง Iframe ที่ซ่อนอยู่
            const iframeName = 'gform_iframe_' + Date.now();
            const iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // 2. สร้าง Form
            const form = document.createElement('form');
            form.action = GOOGLE_FORM_URL;
            form.method = 'POST';
            form.target = iframeName;
            form.style.display = 'none';

            // 3. เตรียมข้อมูลที่จะส่ง
            const dataToSend = {
                [GOOGLE_FORM_ENTRY_MAP.location]: stats.location,
                [GOOGLE_FORM_ENTRY_MAP.hn]: stats.hn,
                [GOOGLE_FORM_ENTRY_MAP.score]: stats.score,
                [GOOGLE_FORM_ENTRY_MAP.time]: stats.time
            };

            // 4. สร้าง Input fields
            for (const key in dataToSend) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = dataToSend[key];
                form.appendChild(input);
            }

            document.body.appendChild(form);

            // 5. จัดการเมื่อส่งเสร็จ
            let loaded = false;
            iframe.onload = function() {
                if (loaded) {
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    resolve(true);
                }
                loaded = true;
            };

            // 6. ส่งฟอร์ม
            form.submit();
            console.log("Data submitted via hidden form:", stats);
            
            // Fallback: Resolve อัตโนมัติใน 1.5 วินาที
            setTimeout(() => {
                if(document.body.contains(form)) {
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    resolve(true);
                }
            }, 1500);

        } catch (error) {
            console.error("Error submitting form:", error);
            reject(error);
        }
    });
}

// --- END: GOOGLE FORM INTEGRATION ---

// ฟังก์ชันบันทึกสถิติ
function saveStatistics() {
    const locationValue = document.getElementById("locationInput").value || "-";
    const hnValue = document.getElementById("hnInput").value || "-";
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const currentDate = new Date();
    const timeString = currentDate.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const stats = {
        location: locationValue,
        hn: hnValue,
        score: totalScore.toString(),
        time: timeString,
        id: Date.now()
    };
    
    // เรียกใช้ฟังก์ชันส่งข้อมูล
    sendToGoogleForm(stats).then(() => {
        let allStats = JSON.parse(localStorage.getItem("newsStatistics")) || [];
        allStats.push(stats);
        localStorage.setItem("newsStatistics", JSON.stringify(allStats));

        updateStatisticsTable();
        showToast("บันทึกคะแนนเรียบร้อยแล้ว");
    }).catch(err => {
        console.error("Online submission failed, saving locally only");
        let allStats = JSON.parse(localStorage.getItem("newsStatistics")) || [];
        allStats.push(stats);
        localStorage.setItem("newsStatistics", JSON.stringify(allStats));
        updateStatisticsTable();
        showToast("บันทึกในเครื่องเรียบร้อย (ออฟไลน์)");
    });
}

// Toast notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        ${message}
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
        z-index: 1000;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    toast.querySelector('svg').style.cssText = 'width: 20px; height: 20px;';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ฟังก์ชันลบรายการสถิติ
function deleteStatistic(id) {
    if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
        let allStats = JSON.parse(localStorage.getItem("newsStatistics")) || [];
        allStats = allStats.filter(stat => stat.id !== id);
        localStorage.setItem("newsStatistics", JSON.stringify(allStats));
        updateStatisticsTable();
    }
}

// ฟังก์ชันแสดงตารางสถิติ
function updateStatisticsTable() {
    const tableBody = document.getElementById("statisticsBody");
    const allStats = JSON.parse(localStorage.getItem("newsStatistics")) || [];

    tableBody.innerHTML = "";

    if (allStats.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #9ca3af;">
                <svg style="width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 20V10"/>
                    <path d="M18 20V4"/>
                    <path d="M6 20v-4"/>
                </svg>
                <div>ยังไม่มีประวัติการบันทึก</div>
            </div>
        `;
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    allStats.sort((a, b) => b.id - a.id);

    allStats.forEach(stat => {
        const row = document.createElement("tr");

        const locationCell = document.createElement("td");
        locationCell.textContent = stat.location || "-";
        locationCell.style.fontWeight = "500";

        const hnCell = document.createElement("td");
        hnCell.textContent = stat.hn || "-";

        const scoreCell = document.createElement("td");
        const scoreBadge = document.createElement("span");
        scoreBadge.className = "score-badge";
        scoreBadge.textContent = stat.score;
        
        if (stat.score >= 7) {
            scoreBadge.classList.add("red");
        } else if (stat.score >= 5) {
            scoreBadge.classList.add("orange");
        } else if (stat.score >= 3) {
            scoreBadge.classList.add("yellow");
        } else {
            scoreBadge.classList.add("green");
        }
        scoreCell.appendChild(scoreBadge);

        const timeCell = document.createElement("td");
        timeCell.textContent = stat.time || "-";
        timeCell.style.fontSize = "0.85rem";
        timeCell.style.color = "#6b7280";

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "&#10005;";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = function() {
            deleteStatistic(stat.id);
        };
        deleteCell.appendChild(deleteButton);

        row.appendChild(locationCell);
        row.appendChild(hnCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    });
}

// ฟังก์ชันคำนวณคะแนนรวม
function updateScore() {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const totalScoreElement = document.getElementById("totalScore");
    const scoreCard = document.getElementById("scoreCard");
    const scoreIndicator = document.getElementById("scoreIndicator");
    
    totalScoreElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        totalScoreElement.style.transform = 'scale(1)';
    }, 150);
    
    totalScoreElement.innerText = totalScore;
    
    scoreCard.className = 'total-score-card';
    
    if (totalScore <= 2) {
        scoreCard.classList.add('level-green');
        scoreIndicator.textContent = 'ไม่เร่งด่วน';
        scoreIndicator.style.background = '#d1fae5';
        scoreIndicator.style.color = '#059669';
    } else if (totalScore <= 4) {
        scoreCard.classList.add('level-yellow');
        scoreIndicator.textContent = 'เร่งด่วนน้อย';
        scoreIndicator.style.background = '#fef3c7';
        scoreIndicator.style.color = '#d97706';
    } else if (totalScore <= 6) {
        scoreCard.classList.add('level-orange');
        scoreIndicator.textContent = 'เร่งด่วน';
        scoreIndicator.style.background = '#ffedd5';
        scoreIndicator.style.color = '#ea580c';
    } else {
        scoreCard.classList.add('level-red');
        scoreIndicator.textContent = 'ฉุกเฉิน';
        scoreIndicator.style.background = '#fee2e2';
        scoreIndicator.style.color = '#dc2626';
    }
    
    const redCategories = checkRedScores();
    updateAdvice(totalScore, redCategories);
}

function updateAdvice(score, redCategories) {
    let advice = "";
    let hasRedScore = redCategories.length > 0;
    
    let redScoreText = "";
    if (hasRedScore) {
        redScoreText = `<div class='red-score-alert'>
            <strong>พบ RED Score ในหมวด:</strong> ${redCategories.map(cat => getCategoryName(cat)).join(", ")}
            <br>แจ้งพยาบาลทันทีเพื่อพิจารณาส่งต่อห้องฉุกเฉิน ER
            <br>ต้องติดตามอาการอย่างใกล้ชิด
        </div>`;
    }
    
    const adviceElement = document.getElementById("advice");
    
    if (score >= 0 && score <= 2) {
        advice = "<strong>Non Urgent</strong> ไม่เร่งด่วน — ให้การดูแลตรวจสอบอาการทั่วไป แนะนำขั้นตอนการรับบริการ";
        adviceElement.style.background = hasRedScore ? '#fee2e2' : '#d1fae5';
        adviceElement.style.color = hasRedScore ? '#dc2626' : '#059669';
        adviceElement.style.borderLeft = hasRedScore ? '4px solid #ef4444' : '4px solid #10b981';
    } else if (score >= 3 && score <= 4) {
        advice = "<strong>Less Urgent</strong> เร่งด่วนน้อย — รายงานพยาบาลเพื่อประเมินซ้ำ พิจารณาให้พบแพทย์ภายใน 30 นาที";
        adviceElement.style.background = '#fef3c7';
        adviceElement.style.color = '#d97706';
        adviceElement.style.borderLeft = '4px solid #f59e0b';
    } else if (score >= 5 && score <= 6) {
        advice = "<strong>Urgent</strong> เร่งด่วน — แจ้งพยาบาลเพื่อประเมินอาการซ้ำและส่งต่อห้องฉุกเฉิน ER";
        adviceElement.style.background = '#ffedd5';
        adviceElement.style.color = '#ea580c';
        adviceElement.style.borderLeft = '4px solid #f97316';
    } else if (score >= 7) {
        advice = "<strong>Emergent</strong> ฉุกเฉิน — แจ้งพยาบาลและแพทย์เพื่อส่งต่อผู้ป่วยให้ได้รับการดูแลขั้นวิกฤต";
        adviceElement.style.background = '#fee2e2';
        adviceElement.style.color = '#dc2626';
        adviceElement.style.borderLeft = '4px solid #ef4444';
    }
    
    adviceElement.innerHTML = advice + (hasRedScore ? redScoreText : "");
}

function resetScores() {
    scores = {
        respiratory: 0,
        oxygen: 0,
        supp_oxygen: 0,
        temperature: 0,
        bp: 0,
        heart_rate: 0,
        avpu: 0
    };
    
    selectedOxygenScale = null;
    
    const allButtons = document.querySelectorAll('.options button');
    allButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    document.getElementById('locationInput').value = '';
    document.getElementById('hnInput').value = '';
    
    updateScore();
    
    const adviceElement = document.getElementById('advice');
    adviceElement.innerHTML = '';
    adviceElement.style.background = '#f9fafb';
    adviceElement.style.borderLeft = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('SUANDOK NEWS v5.0 loaded (Corrected Entry IDs)');
    resetScores();
    updateStatisticsTable();
    
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.parentElement.style.transform = 'scale(1.02)';
        });
        input.addEventListener('blur', function() {
            this.parentElement.parentElement.style.transform = 'scale(1)';
        });
    });
});
