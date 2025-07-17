// グローバル変数
let currentStep = 0;
let userData = {};

const questions = [
    {
        key: 'income',
        question: 'あなたの年収（万円）を教えてください',
        type: 'number',
        placeholder: '例：500',
        validation: (value) => value > 0 && value <= 10000
    },
    {
        key: 'existingDebt',
        question: '現在の借入総額（万円）を教えてください\n（車ローン、分割払い、リボ払い、キャッシングなど、一括払いは除く）',
        type: 'number',
        placeholder: '例：100（借入がない場合は0）',
        validation: (value) => value >= 0
    },
    {
        key: 'monthlyPayment',
        question: '毎月の総返済額（万円）を教えてください',
        type: 'number',
        placeholder: '例：5（返済がない場合は0）',
        validation: (value) => value >= 0
    },
    {
        key: 'age',
        question: 'あなたの年齢を教えてください',
        type: 'number',
        placeholder: '例：35',
        validation: (value) => value >= 18 && value <= 80
    },
    {
        key: 'employment',
        question: 'あなたの雇用形態を選択してください',
        type: 'select',
        options: ['正社員', '個人事業主', 'フリーター']
    },
    {
        key: 'housingType',
        question: 'ご希望の住宅タイプを選択してください',
        type: 'select',
        options: ['新築戸建て', '中古戸建て', '新築マンション', '中古マンション', '注文住宅']
    },
    {
        key: 'area',
        question: 'ご希望のエリア（市区町村）を教えてください',
        type: 'text',
        placeholder: '例：渋谷区、横浜市、大阪市など',
        validation: (value) => value.length > 0
    }
];

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    showCurrentQuestion();
});

// 次の質問を表示
function nextQuestion() {
    const currentQ = questions[currentStep];
    let value;
    
    if (currentQ.type === 'select') {
        const selected = document.querySelector('.option-btn.selected');
        if (!selected) {
            alert('選択肢を選んでください');
            return;
        }
        value = selected.textContent;
    } else {
        const input = document.querySelector('#' + currentQ.key + 'Input') || 
                     document.querySelector('input') || 
                     document.querySelector('select');
        value = input.value;
        
        if (currentQ.validation && !currentQ.validation(value)) {
            alert('正しい値を入力してください');
            return;
        }
    }
    
    // ユーザーの回答を保存
    userData[currentQ.key] = value;
    
    // ユーザーメッセージを追加
    addUserMessage(value);
    
    currentStep++;
    
    if (currentStep < questions.length) {
        setTimeout(() => {
            showCurrentQuestion();
        }, 500);
    } else {
        setTimeout(() => {
            showResult();
        }, 500);
    }
}

// 現在の質問を表示
function showCurrentQuestion() {
    const question = questions[currentStep];
    
    // ボットメッセージを追加
    addBotMessage(question.question);
    
    // 入力エリアを更新
    setTimeout(() => {
        updateInputArea(question);
    }, 300);
}

// ボットメッセージを追加
function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message.replace(/\n/g, '</p><p>')}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ユーザーメッセージを追加
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 入力エリアを更新
function updateInputArea(question) {
    const inputArea = document.getElementById('inputArea');
    
    if (question.type === 'select') {
        inputArea.innerHTML = `
            <div class="question-container">
                <label>${question.question}</label>
                <div class="options-container">
                    ${question.options.map(option => 
                        `<button class="option-btn" onclick="selectOption(this)">${option}</button>`
                    ).join('')}
                </div>
                <button onclick="nextQuestion()" id="nextBtn" disabled>次へ</button>
            </div>
        `;
    } else {
        inputArea.innerHTML = `
            <div class="question-container">
                <label for="${question.key}Input">${question.question}</label>
                <input type="${question.type}" id="${question.key}Input" 
                       placeholder="${question.placeholder || ''}" 
                       ${question.type === 'number' ? 'min="0"' : ''}>
                <button onclick="nextQuestion()" id="nextBtn">次へ</button>
            </div>
        `;
        
        // Enterキーでの送信を有効化
        const input = document.getElementById(question.key + 'Input');
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                nextQuestion();
            }
        });
        
        input.focus();
    }
}

// 選択肢を選択
function selectOption(button) {
    // 他の選択肢を非選択にする
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 選択された選択肢をハイライト
    button.classList.add('selected');
    
    // 次へボタンを有効化
    document.getElementById('nextBtn').disabled = false;
}

// 借入可能額を計算
function calculateLoanAmount() {
    const income = parseFloat(userData.income);
    const existingDebt = parseFloat(userData.existingDebt) || 0;
    const monthlyPayment = parseFloat(userData.monthlyPayment) || 0;
    const age = parseInt(userData.age);
    const employment = userData.employment;
    
    // 基本的な計算ロジック（実際の金融機関の審査基準とは異なります）
    let baseAmount = income * 7; // 年収倍率7倍を基準
    
    // 雇用形態による調整
    if (employment === '正社員') {
        baseAmount *= 1.0;
    } else if (employment === '個人事業主') {
        baseAmount *= 0.8;
    } else if (employment === 'フリーター') {
        baseAmount *= 0.6;
    }
    
    // 年齢による調整（返済期間の考慮）
    if (age > 50) {
        baseAmount *= 0.8;
    } else if (age > 40) {
        baseAmount *= 0.9;
    }
    
    // 既存借入による調整
    baseAmount -= existingDebt * 5; // 既存借入の5倍を減額
    
    // 月々返済額による調整
    const annualPayment = monthlyPayment * 12;
    baseAmount -= annualPayment * 10; // 年間返済額の10倍を減額
    
    // 最低額の設定
    baseAmount = Math.max(baseAmount, 0);
    
    return Math.round(baseAmount);
}

// 物件データの生成
function generateProperties() {
    const areas = ['渋谷区', '新宿区', '港区', '目黒区', '世田谷区'];
    const types = ['新築マンション', '中古マンション', '新築戸建て', '中古戸建て'];
    
    const properties = [];
    
    for (let i = 0; i < 3; i++) {
        const area = areas[Math.floor(Math.random() * areas.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const price = 3000 + Math.floor(Math.random() * 4000); // 3000-7000万円
        const size = 60 + Math.floor(Math.random() * 60); // 60-120㎡
        
        properties.push({
            name: `${area}${type}`,
            area: area,
            type: type,
            price: price,
            size: size,
            rooms: '3LDK',
            station: '徒歩5分'
        });
    }
    
    return properties;
}

// 土地データの生成
function generateLands() {
    const areas = ['渋谷区', '新宿区', '港区', '目黒区', '世田谷区'];
    
    const lands = [];
    
    for (let i = 0; i < 3; i++) {
        const area = areas[Math.floor(Math.random() * areas.length)];
        const price = 2000 + Math.floor(Math.random() * 3000); // 2000-5000万円
        const size = 100 + Math.floor(Math.random() * 100); // 100-200㎡
        
        lands.push({
            name: `${area}の土地`,
            area: area,
            price: price,
            size: size,
            description: '建築条件なし'
        });
    }
    
    return lands;
}

// 結果を表示
function showResult() {
    const loanAmount = calculateLoanAmount();
    
    // チャットコンテナを非表示
    document.getElementById('chatContainer').style.display = 'none';
    
    // 結果コンテナを表示
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.display = 'block';
    
    // 借入可能額を表示
    document.getElementById('loanAmount').textContent = loanAmount.toLocaleString();
    
    // 物件を表示
    const properties = generateProperties();
    const propertyGrid = document.getElementById('propertyGrid');
    
    propertyGrid.innerHTML = properties.map(property => `
        <div class="property-card">
            <div class="property-image">物件画像</div>
            <div class="property-details">
                <h4>${property.name}</h4>
                <p>所在地: ${property.area}</p>
                <p>間取り: ${property.rooms}</p>
                <p>専有面積: ${property.size}㎡</p>
                <p>最寄駅: ${property.station}</p>
                <div class="property-price">${property.price.toLocaleString()}万円</div>
                <button class="contact-btn" onclick="contactProperty('${property.name}')">
                    内覧ご希望の場合はこちら
                </button>
            </div>
        </div>
    `).join('');
    
    // 注文住宅の場合は土地も表示
    if (userData.housingType === '注文住宅') {
        const landRecommendations = document.getElementById('landRecommendations');
        landRecommendations.style.display = 'block';
        
        const lands = generateLands();
        const landGrid = document.getElementById('landGrid');
        
        landGrid.innerHTML = lands.map(land => `
            <div class="land-card">
                <div class="land-image">土地画像</div>
                <div class="land-details">
                    <h4>${land.name}</h4>
                    <p>所在地: ${land.area}</p>
                    <p>土地面積: ${land.size}㎡</p>
                    <p>${land.description}</p>
                    <div class="land-price">${land.price.toLocaleString()}万円</div>
                    <button class="contact-btn" onclick="contactLand('${land.name}')">
                        建築費用の御見積書ご希望の方はこちら
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// 物件への問い合わせ（実際のリンクではなく、デモ用）
function contactProperty(propertyName) {
    alert(`${propertyName}への内覧お申し込みを受け付けました。担当者よりご連絡いたします。`);
}

// 土地への問い合わせ（実際のリンクではなく、デモ用）
function contactLand(landName) {
    alert(`${landName}の建築費用見積もりお申し込みを受け付けました。担当者よりご連絡いたします。`);
}

// リスタート機能
function restart() {
    currentStep = 0;
    userData = {};
    
    // チャットメッセージをクリア
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-content">
                <p>こんにちは！住宅ローンシミュレーションを開始いたします。</p>
                <p>まず、あなたの年収を教えてください。</p>
            </div>
        </div>
    `;
    
    // 結果コンテナを非表示
    document.getElementById('resultContainer').style.display = 'none';
    
    // チャットコンテナを表示
    document.getElementById('chatContainer').style.display = 'block';
    
    // 土地推奨セクションを非表示
    document.getElementById('landRecommendations').style.display = 'none';
    
    // 最初の質問を表示
    showCurrentQuestion();
}
