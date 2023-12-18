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
            listItem.textContent = `${gift.name} (剩余数量: ${gift.quantity})`;
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

function performRaffle() {
    const eligibleParticipants = participants.filter(p => !p.hasWon);
    const currentGift = gifts.find(g => g.quantity > 0); // 找到数量大于0的第一个奖品

    if (eligibleParticipants.length === 0) {
        document.getElementById('result').innerHTML = '没有更多的参与者了！';
        return;
    }

    if (!currentGift) {
        document.getElementById('result').innerHTML = '所有奖品已抽完！';
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

    document.getElementById('result').innerHTML = `恭喜 ${winner.name} 获得 ${currentGift.name}！`;
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
    const filename = `lucky_${timestamp}.csv`;
    
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
    const filename = `notWinner_${timestamp}.csv`;
    
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

document.getElementById('downloadNotWinnersCSV').addEventListener('click', downloadNotWinnersCSV);

// Expose the raffle function to the global scope
window.startRaffle = performRaffle;
