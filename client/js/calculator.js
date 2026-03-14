// Calculator state
let calculator = {
    currentInput: '',
    previousInput: '',
    operator: null,
    memory: 0,
    shouldReset: false
};

// Display elements
const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const memoryDisplay = document.getElementById('memoryValue');

function updateDisplay() {
    if (expressionDisplay) {
        if (calculator.operator && calculator.previousInput) {
            expressionDisplay.textContent = `${calculator.previousInput} ${calculator.operator} ${calculator.currentInput || '_'}`;
        } else {
            expressionDisplay.textContent = calculator.currentInput || '0';
        }
    }
    if (resultDisplay) {
        resultDisplay.textContent = calculator.currentInput || '0';
    }
    if (memoryDisplay) {
        memoryDisplay.textContent = calculator.memory;
    }
}

function appendNumber(num) {
    if (num === '.' && calculator.currentInput.includes('.')) return;
    if (calculator.shouldReset) {
        calculator.currentInput = '';
        calculator.shouldReset = false;
    }
    calculator.currentInput += num;
    updateDisplay();
}

function appendOperator(op) {
    if (calculator.currentInput === '' && calculator.previousInput === '') return;
    
    if (calculator.previousInput !== '' && calculator.currentInput !== '' && !calculator.shouldReset) {
        calculate();
    }
    
    calculator.operator = op;
    if (calculator.currentInput !== '') {
        calculator.previousInput = calculator.currentInput;
        calculator.currentInput = '';
    }
    calculator.shouldReset = false;
    updateDisplay();
}

function calculate() {
    if (!calculator.operator || calculator.previousInput === '' || calculator.currentInput === '') return;
    
    let result;
    const prev = parseFloat(calculator.previousInput);
    const curr = parseFloat(calculator.currentInput);
    
    switch(calculator.operator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': 
            if (curr === 0) {
                alert('Cannot divide by zero!');
                return;
            }
            result = prev / curr; 
            break;
        case '%': result = prev % curr; break;
        default: return;
    }
    
    calculator.currentInput = result.toString();
    calculator.operator = null;
    calculator.previousInput = '';
    calculator.shouldReset = true;
    updateDisplay();
}

function scientific(func) {
    if (calculator.currentInput === '') return;
    
    let value = parseFloat(calculator.currentInput);
    let result;
    
    switch(func) {
        case 'sin': result = Math.sin(value * Math.PI / 180); break;
        case 'cos': result = Math.cos(value * Math.PI / 180); break;
        case 'tan': result = Math.tan(value * Math.PI / 180); break;
        case 'log': result = Math.log10(value); break;
        case 'ln': result = Math.log(value); break;
        case 'sqrt': result = Math.sqrt(value); break;
        case 'square': result = Math.pow(value, 2); break;
        case 'fact': 
            if (value < 0 || !Number.isInteger(value)) {
                alert('Factorial only for positive integers!');
                return;
            }
            result = factorial(value);
            break;
        default: return;
    }
    
    calculator.currentInput = result.toString();
    calculator.shouldReset = true;
    updateDisplay();
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function memoryClear() {
    calculator.memory = 0;
    updateDisplay();
}

function memoryRecall() {
    calculator.currentInput = calculator.memory.toString();
    calculator.shouldReset = true;
    updateDisplay();
}

function memoryAdd() {
    if (calculator.currentInput !== '') {
        calculator.memory += parseFloat(calculator.currentInput);
        updateDisplay();
    }
}

function memorySubtract() {
    if (calculator.currentInput !== '') {
        calculator.memory -= parseFloat(calculator.currentInput);
        updateDisplay();
    }
}

function clearAll() {
    calculator.currentInput = '';
    calculator.previousInput = '';
    calculator.operator = null;
    calculator.shouldReset = false;
    updateDisplay();
}

function backspace() {
    calculator.currentInput = calculator.currentInput.slice(0, -1);
    updateDisplay();
}

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') appendOperator(e.key);
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clearAll();
    if (e.key === 'Backspace') backspace();
});

window.appendNumber = appendNumber;
window.appendOperator = appendOperator;
window.calculate = calculate;
window.scientific = scientific;
window.memoryClear = memoryClear;
window.memoryRecall = memoryRecall;
window.memoryAdd = memoryAdd;
window.memorySubtract = memorySubtract;
window.clearAll = clearAll;
window.backspace = backspace;