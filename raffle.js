// raffle.js
let participants = [];
let gifts = [];
let winners = [];

function readFile(input, isGift) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        if (isGift) {
            gifts = csvToArray(text, true);
            updateAvailablePrizesList();
        } else {
            participants = csvToArray(text, false);
            updateEligibleParticipantsList();
        }
    };

    reader.readAsText(file);
}

function csvToArray(csvString, isGift) {
    const rows = csvString.trim().split('\n').slice(1);
    return rows.map(row => {
        const cells = row.split(',');
        if (isGift) {
            return {
                name: cells[0].trim(),
                quantity: parseInt(cells[1], 10)
            };
        } else {
            return {
                name: cells[0].trim(),
                email: cells[1].trim(),
                photo: cells[2].trim(),
                hasWon: false
            };
        }
    });
}

function updateEligibleParticipantsList() {
    const list = document.getElementById('eligibleParticipantsList');
    list.innerHTML = ''; // Reset the list
    let total = 0;

    participants.forEach(participant => {
        if (!participant.hasWon) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${participant.name} (${participant.email})`;
            list.appendChild(listItem);
            total++; // Increment total for each eligible participant
        }
    });

    // Update the total participants count on the webpage
    document.getElementById('totalParticipants').textContent = total;
}

function updateAvailablePrizesList() {
    const list = document.getElementById('availablePrizesList');
    list.innerHTML = '';
    gifts.forEach(gift => {
        if (gift.quantity > 0) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${gift.name} (剩餘數量: ${gift.quantity})`;
            list.appendChild(listItem);
        }
    });
}

function updateWinnersList() {
    const tableBody = document.getElementById('winnersList').querySelector('tbody');
    tableBody.innerHTML = '';
    winners.forEach(winner => {
        const row = tableBody.insertRow();
        const nameCell = row.insertCell(0);
        const prizeCell = row.insertCell(1);
        const timestampCell = row.insertCell(2);  // 新增时间戳的单元格
        nameCell.textContent = winner.name;
        prizeCell.textContent = winner.prize;
        timestampCell.textContent = winner.timestamp;  // 显示时间戳
    });
}


function startRaffle() {
    // 检查是否已经上传了参与者名单和奖品清单
    if (participants.length === 0 || gifts.length === 0) {
        // 获取错误提示模态框元素
        const errorModalElement = document.getElementById('errorModal');
        const errorModalMessageElement = document.getElementById('errorModalMessage');

        // 设置错误信息
        if (participants.length === 0 && gifts.length === 0) {
            errorModalMessageElement.textContent = '需先上傳人員名單和獎品清單。';
        } else if (participants.length === 0) {
            errorModalMessageElement.textContent = '需先上傳人員名單。';
        } else if (gifts.length === 0) {
            errorModalMessageElement.textContent = '需先上傳獎品清單。';
        }

        // 显示错误提示模态框
        const errorModal = new bootstrap.Modal(errorModalElement);
        errorModal.show();
    } else {
        // 如果都已上传，则执行抽奖
        performRaffle();
    }
}

// raffle.js 中的 performRaffleAnimation 函数
function performRaffleAnimation() {
    const eligibleParticipantsElements = document.querySelectorAll('#eligibleParticipantsList .list-group-item');
  
    // 检查是否有可参加抽奖的人员
    if (eligibleParticipantsElements.length === 0) {
        alert('没有可抽奖的参与者。');
        return;
    }
    
    let currentIndex = 0; // 当前高亮的参与者索引
    const maxRounds = 30; // 动画重复的次数
    const intervalTime = 100000; // 切换高亮的时间间隔（毫秒）
    
    // 禁用“开始抽奖”按钮
    const raffleButton = document.getElementById('startRaffle');
    raffleButton.disabled = true;
    
    const intervalId = setInterval(() => {
        // 移除所有参与者的高亮
        eligibleParticipantsElements.forEach((element, index) => {
            element.classList.remove('highlight');
        });
        
        // 高亮下一个参与者
        eligibleParticipantsElements[currentIndex % eligibleParticipantsElements.length].classList.add('highlight');
        
        currentIndex++;
        
        // 如果已达到最大轮数，则停止动画，并进行抽奖
        if (currentIndex >= maxRounds) {
            clearInterval(intervalId);
            performRaffle(); // 执行抽奖
        }
    }, intervalTime);
}

function performRaffle() {
    const eligibleParticipants = participants.filter(p => !p.hasWon);
    const currentGift = gifts.find(g => g.quantity > 0); // 找到数量大于0的第一个奖品

    if (eligibleParticipants.length === 0) {
        document.getElementById('result').innerHTML = '沒有更多人可以參加抽獎了！';
        return;
    }

    if (!currentGift) {
        document.getElementById('result').innerHTML = '所有獎品都抽完了！';
        return;
    }

    const participantIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const winner = eligibleParticipants[participantIndex];

    winner.hasWon = true;
    currentGift.quantity -= 1; // 减少当前奖品的数量
    const timestamp = new Date().toLocaleString();
    winners.push({ 
        name: winner.name, 
        prize: currentGift.name, 
        timestamp: timestamp 
    });

    updateEligibleParticipantsList();
    updateAvailablePrizesList();
    updateWinnersList();

    // 使用Bootstrap模态框显示中奖信息
    const winnerModalBody = document.querySelector('#winnerModal .modal-body');
    winnerModalBody.textContent = `恭喜 ${winner.name} 獲得 ${currentGift.name}！`;
    
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();
	// 抽奖结束后，重新启用“开始抽奖”按钮
    document.getElementById('startRaffle').disabled = false;
}

// Event listeners for file input
document.getElementById('namesFile').addEventListener('change', function(event) {
    readFile(event.target, false);
});

document.getElementById('giftsFile').addEventListener('change', function(event) {
    readFile(event.target, true);
});

function downloadWinnersCSV() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const main_title=document.getElementById("main_title").value
    
    const filename = `${main_title}_Winners_${timestamp}.csv`;
    
    

    // UTF-8 的 BOM
    let bom = "\uFEFF";
    let csvContent = "data:text/csv;charset=utf-8," + bom;
    csvContent += "Name,Prize,Timestamp\r\n"; // CSV头部
    winners.forEach(function(winner) {
        csvContent += `"${winner.name}","${winner.prize}","${winner.timestamp}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

function downloadNotWinnersCSV() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const main_title=document.getElementById("main_title").value
    const filename = `${main_title}_notWinner_${timestamp}.csv`;
    
    let bom = "\uFEFF";
    let csvContent = "data:text/csv;charset=utf-8," + bom;
    csvContent += "Name,Email,Photo\r\n"; // CSV头部

    const notWinners = participants.filter(p => !p.hasWon);
    notWinners.forEach(function(participant) {
        csvContent += `"${participant.name}","${participant.email}","${participant.photo}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}


// 为上传人员名单的 input 元素添加 change 事件监听器
document.getElementById('namesFile').addEventListener('change', function(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        // 获取文件名
        const fileName = input.files[0].name;
        
        // 更新网页标题
        document.title = fileName;

        // 继续执行文件读取的其他逻辑
        readFile(input, false);
    }
});

document.getElementById('downloadNotWinnersCSV').addEventListener('click', downloadNotWinnersCSV);
document.getElementById('startRaffle').addEventListener('click', performRaffleAnimation);
// Expose the raffle function to the global scope
