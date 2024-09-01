let questions = [];
let currentQuestionIndex = 0;
let selectedOption = null;
let correctAnswer;
let currentLevel = 1;
let correctAnswersCount = 0;
let questionTitleIndex = 1;  // Para manter o controle do número da pergunta no título

function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            // Filtrar perguntas por nível atual
            questions = data.filter(question => question.nivel === currentLevel);
            shuffleArray(questions); // Embaralha as perguntas
            currentQuestionIndex = 0; // Reinicia o índice de perguntas para o novo nível
            displayQuestion(currentQuestionIndex); // Exibe a primeira pergunta do novo nível
        })
        .catch(error => console.error('Erro ao carregar as perguntas:', error));
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayQuestion(index) {
    clearFeedbackMessage();  // Limpa a mensagem de feedback ao exibir uma nova pergunta
    const question = questions[index];

    // Restaurar todas as opções de resposta
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.style.display = 'flex';  // Restaura a exibição de todas as opções
    });

    // Exibir a nova pergunta
    document.getElementById('question').textContent = question.question_text;
    question.options.forEach((option, i) => {
        document.querySelector(`.option[data-option="${i + 1}"] .text`).textContent = option;
    });

    correctAnswer = question.correct_option;
    document.getElementById('question-number').textContent = `Pergunta ${questionTitleIndex} - Nível ${currentLevel}`;
}


function selectOption(option) {
    selectedOption = option;
    document.getElementById('confirmation-modal').style.display = 'flex';
}

function confirmChoice(confirm) {
    document.getElementById('confirmation-modal').style.display = 'none';
    if (confirm) {
        checkAnswer();
    }
}

function checkAnswer() {
    let messageElement = document.getElementById('feedback-message');
    const isCorrect = parseInt(selectedOption) === correctAnswer;
    messageElement.style.display = 'block';
    if (isCorrect) {
        messageElement.innerHTML = 'VOCÊ ACERTOU';
        messageElement.style.color = 'green';
        correctAnswersCount++;
        updateProgressBar();
        questionTitleIndex++;  // Isso deve ocorrer aqui, após o usuário acertar
        setTimeout(() => {
            nextQuestion();
        }, 2000); // 2 segundos para seguir para a próxima pergunta
    } else {
        messageElement.innerHTML = 'VOCÊ ERROU';
        messageElement.style.color = 'red';
        setTimeout(() => {
            restartQuiz();
        }, 4000); // Reinicia o quiz após 4 segundos se errar
    }

    let correctOptionElement = document.querySelector(`.option[data-option="${correctAnswer}"]`);
    blink(correctOptionElement, 5, 200); // Pisca mais rápido, com 200ms entre cada troca
}

function blink(element, times, speed) {
    let blinkCount = 0;
    let originalColor = element.style.backgroundColor;
    let timer = setInterval(function () {
        element.style.backgroundColor = blinkCount % 2 === 0 ? 'yellow' : originalColor;
        blinkCount++;
        if (blinkCount >= times * 2) {
            clearInterval(timer);
            element.style.backgroundColor = originalColor;
        }
    }, speed);
}

function nextQuestion() {
    if (correctAnswersCount === 5) {
        currentLevel++;
        correctAnswersCount = 0;

        if (currentLevel > 3) {
            alert("Você completou todas as perguntas!");
            restartQuiz(); // Reinicia o quiz se completar todos os níveis
        } else {
            showLevelTransitionModal(); // Exibe o modal de transição de nível
        }
    } else {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex); // Exibe a próxima pergunta
        } else {
            showLevelTransitionModal(); // Exibe o modal de transição de nível se completar as perguntas do nível
        }
    }
}

function loadNextQuestion() {
    // Filtrar as perguntas do nível atual
    const questionsForLevel = questions.filter(q => q.nivel === currentLevel);
    if (currentQuestionIndex < questionsForLevel.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex); // Exibe a próxima pergunta
    } else {
        currentQuestionIndex = 0; // Reinicia o índice para o novo nível
        displayQuestion(currentQuestionIndex);
    }
}

function skipQuestion(button) {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++; // Avança para a próxima pergunta na sequência
        displayQuestion(currentQuestionIndex);
    } else {
        alert("Esta é a última pergunta!");
    }
    button.disabled = true; // Desativa o botão que foi usado
}

function universityHelp(button) {
    // Exibir modal dos universitários
    document.getElementById('university-modal').style.display = 'flex';

    // Mostrar a resposta correta em cada universitário
    for (let i = 0; i < 3; i++) {
        document.getElementById(`university-${i + 1}`).textContent = correctAnswer;
    }

    button.disabled = true; // Desativa o botão de ajuda dos universitários após o uso

    // Fechar a janela dos universitários após 5 segundos
    setTimeout(() => {
        document.getElementById('university-modal').style.display = 'none';
    }, 5000); // 5000 milissegundos = 5 segundos
}


function plateHelp(button) {
    // Exibir modal de placas
    document.getElementById('plates-modal').style.display = 'flex';

    // Gerar respostas sugeridas com base no nível
    const suggestedAnswers = generatePlateSuggestions();

    // Exibir as respostas nas placas
    for (let i = 0; i < 4; i++) {
        document.getElementById(`plate-${i + 1}`).textContent = suggestedAnswers[i];
    }

    button.disabled = true; // Desativa o botão de ajuda das placas após o uso

    // Fechar a janela das placas após 5 segundos
    setTimeout(() => {
        document.getElementById('plates-modal').style.display = 'none';
    }, 5000); // 5000 milissegundos = 5 segundos
}

function generatePlateSuggestions() {
    const { minRate, maxRate } = getCorrectRateRange();
    const suggestedAnswers = [];

    if (minRate === 100 && maxRate === 100) {
        // Se a taxa de acerto é 100%, todas as placas devem mostrar a resposta correta
        for (let i = 0; i < 4; i++) {
            suggestedAnswers.push(correctAnswer);
        }
    } else {
        // Caso contrário, usa a lógica de probabilidade
        const incorrectOptions = [];
        for (let i = 1; i <= 4; i++) {
            if (i !== correctAnswer) {
                incorrectOptions.push(i);
            }
        }

        for (let i = 0; i < 4; i++) {
            const probability = Math.random() * 100;

            if (probability >= minRate && probability <= maxRate) {
                suggestedAnswers.push(correctAnswer);
            } else {
                const randomIncorrectAnswer = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
                suggestedAnswers.push(randomIncorrectAnswer);
            }
        }
    }

    // Embaralha as respostas nas placas
    shuffleArray(suggestedAnswers);

    return suggestedAnswers;
}


function getCorrectRateRange() {
    let minRate, maxRate;
    if (currentLevel === 1) {
        minRate = 100; // 100% de chance de acertar no nível 1
        maxRate = 100;
    } else if (currentLevel === 2) {
        minRate = 80; // Alta chance de acertar no nível 2
        maxRate = 100;
    } else if (currentLevel === 3) {
        minRate = 80; // Alta chance de acertar no nível 3
        maxRate = 100;
    }
    return { minRate, maxRate };
}


function cardHelp(button) {
    // Exibir modal de cartas
    document.getElementById('cards-modal').style.display = 'flex';
    button.disabled = true; // Desativa o botão de ajuda das cartas após o uso
}

function chooseCard(cardNumber) {
    const cards = ['as-de-paus', 'dois-de-coracoes', 'tres-de-diamantes', 'rei-de-espadas'];
    const chosenCard = cards[Math.floor(Math.random() * cards.length)];
    const cardResultElement = document.getElementById('card-result');

    // Atualizar a carta escolhida visualmente
    document.querySelector(`#cards-container img:nth-child(${cardNumber})`).src = `ícones/Cartas/${chosenCard}.png`;

    // Definir ação com base na carta escolhida
    let message;
    let numberToRemove = 0;
    if (chosenCard === 'as-de-paus') {
        message = 'Removeremos 1 resposta incorreta.';
        numberToRemove = 1;
    } else if (chosenCard === 'dois-de-coracoes') {
        message = 'Removeremos 2 respostas incorretas.';
        numberToRemove = 2;
    } else if (chosenCard === 'tres-de-diamantes') {
        message = 'Removeremos 3 respostas incorretas.';
        numberToRemove = 3;
    } else if (chosenCard === 'rei-de-espadas') {
        message = 'Nenhuma resposta será removida.';
        numberToRemove = 0;
    }

    // Exibir mensagem e definir um delay para a remoção das respostas
    cardResultElement.textContent = message;
    setTimeout(() => {
        document.getElementById('cards-modal').style.display = 'none';
        if (numberToRemove > 0) {
            setTimeout(() => {
                removeIncorrectAnswers(numberToRemove);
            }, 100); // Delay de 0.5 segundos após a carta ser ocultada
        }
        cardResultElement.textContent = ''; // Limpa o texto após a mensagem ser exibida
    }, 3000); // Modal de cartas visível por 3 segundos
}


function removeIncorrectAnswers(numberToRemove) {
    const options = document.querySelectorAll('.option');
    let incorrectOptions = [];

    // Identificar opções incorretas
    options.forEach(option => {
        const optionNumber = parseInt(option.dataset.option);
        if (optionNumber !== correctAnswer) {
            incorrectOptions.push(option);
        }
    });

    // Embaralhar as opções incorretas e remover as primeiras `numberToRemove`
    shuffleArray(incorrectOptions);
    for (let i = 0; i < numberToRemove; i++) {
        if (incorrectOptions[i]) {
            incorrectOptions[i].style.display = 'none';
        }
    }
}


function restartQuiz() {
    currentLevel = 1;
    correctAnswersCount = 0;
    currentQuestionIndex = 0;
    questionTitleIndex = 1; // Reinicia o número da pergunta no título
    loadQuestions();
    shuffleArray(questions);
    resetHelpButtons();
    resetProgressBar();
    resetCards(); // Adiciona essa linha para resetar as cartas
    displayQuestion(currentQuestionIndex);
}

function resetCards() {
    // Reinicia as cartas para o estado original (viradas para baixo)
    const cards = document.querySelectorAll('#cards-container img');
    cards.forEach(card => {
        card.src = 'ícones/Cartas/coringas.png'; // Caminho da imagem original das cartas viradas
    });

    // Limpa o texto que mostra o resultado da carta
    const cardResultElement = document.getElementById('card-result');
    cardResultElement.textContent = '';
}


function resetHelpButtons() {
    const helpButtons = document.querySelectorAll('#help-section button');
    helpButtons.forEach(button => {
        button.disabled = false;
    });
}

function updateProgressBar() {
    const level = currentLevel;
    const boxId = `level-${level}-q${correctAnswersCount}`;
    const progressBox = document.getElementById(boxId);
    progressBox.style.backgroundColor = 'green';
}

function resetProgressBar() {
    const boxes = document.querySelectorAll('.progress-box');
    boxes.forEach(box => {
        box.style.backgroundColor = '#444';
    });
}

function clearFeedbackMessage() {
    let messageElement = document.getElementById('feedback-message');
    messageElement.style.display = 'none';
    messageElement.innerHTML = '';
}

function showLevelTransitionModal() {
    const modal = document.getElementById('level-transition-modal');
    modal.style.display = 'flex';
}

function closeLevelTransitionModal() {
    const modal = document.getElementById('level-transition-modal');
    modal.style.display = 'none';
    loadQuestions(); // Carrega as perguntas para o próximo nível após fechar o modal
}

document.addEventListener('DOMContentLoaded', loadQuestions);
