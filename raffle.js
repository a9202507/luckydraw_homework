// raffle.js
let participants = [];
let gifts = [];
let winners = [];

function readFile(input, isGift) {
    const file = input.files[0];
    const reader = new FileReader();
    document.getElementById("confirmRaffle-button").disabled = true;

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

function performRaffle() {

    document.getElementById("startRaffle-button").disabled = true;
    document.getElementById("randomSorting-button").disabled = true;

    const eligibleParticipants = participants.filter(p => !p.hasWon);
    const currentGift = gifts.find(g => g.quantity > 0); // 找到数量大于0的第一个奖品
    /* const eligibleParticipantsElements = document.querySelectorAll('#eligibleParticipantsList .list-group-item'); */
    var eligibleParticipantsElements = document.getElementById('eligibleParticipantsList').children;
    var index = 0;

    //對人員列表，輪流高亮  
    const intervalId = setInterval(function() {
        index = (index + 1) %  eligibleParticipantsElements.length;
        for (var i = 0; i < eligibleParticipantsElements.length; i++) {
            eligibleParticipantsElements[i].style.backgroundColor = (i === index) ? 'yellow' : '';
        }
        
    }, 100);

    // 生成3到7秒之間的隨機時間
    const during_time = Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000;

    // 在during_time之前的某个时刻减慢速度
    const slowDownTime = during_time - 1000; // 减慢速度的时间点

    setTimeout(() => {
        clearInterval(intervalId); // 停止間隔
        handleStoppedHighlighting(index); // 輸出當前的人員index，或者可以調用其他函數來處理這個index
    }, during_time);

    if (eligibleParticipants.length === 0) {
        document.getElementById('result').innerHTML = '沒有更多人可以參加抽獎了！';
        return;
    }

    if (!currentGift) {
        document.getElementById('result').innerHTML = '所有獎品都抽完了！';
        return;
    }

    //const participantIndex = Math.floor(Math.random() * eligibleParticipants.length);
    //const winner = eligibleParticipants[participantIndex];
    //const winner = eligibleParticipants[index];

    /*
    winner.hasWon = true;
    currentGift.quantity -= 1; // 减少当前奖品的数量
    const timestamp = new Date().toLocaleString();
    winners.push({ 
        name: winner.name, 
        prize: currentGift.name, 
        timestamp: timestamp 
    });
    */
    

    // 使用Bootstrap模态框显示中奖信息
    /*
    const winnerModalBody = document.querySelector('#winnerModal .modal-body');
    winnerModalBody.textContent = `恭喜 ${winner.name} 獲得 ${currentGift.name}！`;
    
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();
    */
}


function handleStoppedHighlighting(currentIndex) {
    // 在这里编写处理逻辑
    const eligibleParticipants = participants.filter(p => !p.hasWon);
    const currentGift = gifts.find(g => g.quantity > 0);
    var eligibleParticipantsElements = document.getElementById('eligibleParticipantsList').children;
    eligibleParticipantsElements[currentIndex].style.backgroundColor = 'orange';
    var winner = eligibleParticipants[currentIndex]
    const winnerModalBody = document.querySelector('#winnerModal .modal-body');
    winnerModalBody.textContent = `恭喜 ${winner.name} 獲得 ${currentGift.name}！`;
    
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();

    winner.hasWon = true;
    currentGift.quantity -= 1; // 减少当前奖品的数量
    const timestamp = new Date().toLocaleString();
    winners.push({ 
        name: winner.name, 
        prize: currentGift.name, 
        timestamp: timestamp 
    });

    //啟動confirm 按鈕
    document.getElementById("confirmRaffle-button").disabled = false;
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

function confirmRaffle(){
    document.getElementById("startRaffle-button").disabled = false;
    document.getElementById("confirmRaffle-button").disabled = true;
    document.getElementById("randomSorting-button").disabled = false;
    
    updateEligibleParticipantsList();
    updateAvailablePrizesList();
    updateWinnersList();
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


function sortListByName() {
    //updateEligibleParticipantsList()
    participants.sort(function(a, b) {
        return Math.random() > 0.5 ? -1 : 1;
       });

    updateEligibleParticipantsList()

    /*
    // Get the list items
    const list = document.getElementById('eligibleParticipantsList');
    let listItems = list.getElementsByTagName('li');

    // Convert the HTMLCollection to an array for sorting
    listItems = Array.from(listItems);

    // Sort the array of list items based on the text content, which has the participant's name
    listItems.sort(function(a, b) {
        return Math.random() > 0.5 ? -1 : 1;
       });

    
    // Append each sorted item back to the list
    listItems.forEach(function(item) {
        list.appendChild(item);
    });

    */    
}
document.getElementById('downloadNotWinnersCSV').addEventListener('click', downloadNotWinnersCSV);
document.getElementById('confirmRaffle-button').addEventListener('click', confirmRaffle);
document.getElementById('randomSorting-button').addEventListener('click', sortListByName);
// Expose the raffle function to the global scope
