import grayMatter from "https://cdn.jsdelivr.net/npm/gray-matter@4.0.3/+esm";
import markdownIt from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";

let testKey;
let currentQuestionNumber = 1;
let rightAnswer;
let totalNumberOfQuestions;

//most used elements
const keyContainer = document.querySelector(".key-container");
const appContainer = document.querySelector(".app-container");
const testContainer = document.querySelector(".test-container");
const explanationHeader = document.getElementById("explanation-header");
const explanationContent = document.getElementById("explanation-content");
const resultsContainer = document.querySelector(".results-container");

//start demo
const btnDemo = document.getElementById("btnDemo");
btnDemo.addEventListener("click", function () {
  setTimeout(() => {
    testKey = `demo`;
    keyContainer.style = "display: none";
    appContainer.style = "display: block";
    loadTotalNumberOfQuestions();
    loadTest();
  }, 300);
});

//start test
const btnStart = document.getElementById("btnStart");
const key = document.getElementById("key");
btnStart.addEventListener("click", function () {
  window.alert("Уведіть правильний ключ");
  key.value = "";
});

async function loadTotalNumberOfQuestions() {
  const firstQuestion = await fetch(`./test-database/${testKey}/1.md`);
  const firstQuestionContent = await firstQuestion.text();
  const parsedData = grayMatter(firstQuestionContent);
  document.getElementById("totalNumberOfQuestions").innerHTML =
    parsedData.data.totalNumberOfQuestions;
  totalNumberOfQuestions = parsedData.data.totalNumberOfQuestions;
}

async function loadTest() {
  document.getElementById("questionNumber").innerHTML = currentQuestionNumber;

  //fetch test from markdown

  const testMarkdown = await fetch(
    `/test-database/${testKey}/${currentQuestionNumber}.md`
  );

  const testContent = await testMarkdown.text();

  //grayMatter `frontmatter` parsing
  const parsedData = grayMatter(testContent);

  question.innerHTML = parsedData.data.question;
  answer0.innerHTML = parsedData.data.answer0;
  answer1.innerHTML = parsedData.data.answer1;
  answer2.innerHTML = parsedData.data.answer2;
  answer3.innerHTML = parsedData.data.answer3;
  answer4.innerHTML = parsedData.data.answer4;
  rightAnswer = parsedData.data.rightAnswer;

  //Markdown-it `content` parsing
  const md = new markdownIt();
  const htmlContent = md.render(parsedData.content);
  explanationContent.innerHTML = htmlContent;
}

//PRESSING ANSWER BUTTON
//check which radio is checked
let answerBtn = document.getElementById("answerBtn");
let radio0 = document.getElementById("radio0");
let radio1 = document.getElementById("radio1");
let radio2 = document.getElementById("radio2");
let radio3 = document.getElementById("radio3");
let radio4 = document.getElementById("radio4");
let checkedAnswer;
function checkedRadio() {
  if (radio0.checked) {
    checkedAnswer = 0;
  } else if (radio1.checked) {
    checkedAnswer = 1;
  } else if (radio2.checked) {
    checkedAnswer = 2;
  } else if (radio3.checked) {
    checkedAnswer = 3;
  } else if (radio4.checked) {
    checkedAnswer = 4;
  }
}
//mark right answer with check, wrong with cross
const inputValue = document.querySelectorAll(`input[name="option"]`);
function markAnswer() {
  inputValue.forEach((option) => {
    if (option.value == rightAnswer) {
      option.classList.add("correct");
    } else if (option.value == checkedAnswer) {
      option.classList.add("wrong");
    }
    if (option.value == checkedAnswer) {
      option.checked = true;
    }
  });
}
//push answer in array that stores answers
let storedAnswers = [];
function pushAnswerInArray() {
  let existingAnswer = storedAnswers.find(
    (item) => item.currentQuestionNumber === currentQuestionNumber
  );
  if (existingAnswer == storedAnswers.currentQuestionNumber) {
    storedAnswers.push({ currentQuestionNumber, checkedAnswer, rightAnswer });
  }
}
//check if answer right + remove poiner event
let isCorrect = document.getElementById("isCorrect");
answerBtn.addEventListener("click", checkIfCorrect);
function checkIfCorrect() {
  checkedRadio();
  if (checkedAnswer == undefined) {
    window.alert("Необхідно обрати відповідь");
    return;
  } else if (rightAnswer === checkedAnswer) {
    markAnswer();
    isCorrect.innerHTML = "Відповідь правильна";
    isCorrect.style = "color:green";
  } else {
    markAnswer();
    isCorrect.innerHTML = "Відповідь не правильна";
    isCorrect.style = "color:red";
  }
  pushAnswerInArray();
  explanationContent.style = "display: block";
  explanationHeader.style = "display: block";
  testContainer.style = "pointer-events: none";
}
//check if answer was already in aswered (after pressing next, prev buttons), if yes show answer
function checkIfWasAnswered() {
  let existingAnswer = storedAnswers.find(
    (item) => item.currentQuestionNumber === currentQuestionNumber
  );
  setTimeout(() => {
    if (existingAnswer) {
      checkedAnswer = existingAnswer.checkedAnswer;
      markAnswer();
      checkIfCorrect();
    }
  }, 100);
}

//CLEAR HTML BEFORE PRESSING NEXT/PREV BUTTONS
function clearHTML() {
  document.getElementById("questionNumber").innerHTML = "";
  question.innerHTML = "";
  let answerx = document.querySelectorAll("label");
  for (let c = 0; c < answerx.length; c++) {
    answerx[c].innerHTML = "";
  }
  inputValue.forEach((option) => {
    option.classList.remove("correct", "wrong");
  });
  checkedAnswer = undefined;
  rightAnswer = null;
  explanationHeader.style = "display:none";
  explanationContent.innerHTML = "";
  explanationContent.style = "display: none";
  testContainer.style = "display: none";
  isCorrect.innerHTML = "";
  testContainer.style = "pointer-events: auto";
  let input = document.querySelectorAll("input");
  for (let i = 0; i < input.length; i++) {
    input[i].checked = false;
  }
}

//PRESS "NEXT"
let btnNextQ = document.getElementById("btnNextQ");
btnNextQ.addEventListener("click", function () {
  clearHTML();
  if (currentQuestionNumber != totalNumberOfQuestions) {
    currentQuestionNumber++;
  }
  loadTest();
  checkIfWasAnswered();
});

//PRESS "PREV"
let btnPrevQ = document.getElementById("btnPrevQ");
btnPrevQ.addEventListener("click", function () {
  clearHTML();
  if (currentQuestionNumber != 1) {
    currentQuestionNumber--;
  }
  loadTest();
  checkIfWasAnswered();
});

//PRESS "END"
let btnEnd = document.getElementById("btnEnd");
let result = document.getElementById("result")
let correctAnswers = 0;
btnEnd.addEventListener("click", function () {
  appContainer.style = "display: none";
  resultsContainer.style = "display: block";
  storedAnswers.forEach((answer) => {
    if (answer.checkedAnswer == answer.rightAnswer) {
      correctAnswers++;
    }
  });
  result.innerHTML = `Ви маєте: ${Math.round(correctAnswers * 100 / totalNumberOfQuestions)}%</br>Правильних відповідей: ${correctAnswers} із ${totalNumberOfQuestions}`
});
