class Quiz {
  constructor(_genre, _questions) {
    this.genre = _genre;
    this.questions = _questions;
    this.noOfQuestions = this.questions.length;
    this.selectedAnswers = [];
    this.currentQuestion = 0;
  }
}

class Answer {
  constructor(_text, _isCorrect = false) {
    this.text = _text;
    this.isCorrect = _isCorrect;
  }
}

class Question {
  constructor(_text, _alternatives) {
    this.text = _text;
    this.alternatives = _alternatives;
  }
}

let quiz = null;

//Function for switching which CSS file is used when user toggles dark/light mode
function darkMode() {
  let darkSwitch = $("#toggle-switch").is(":checked");

  if (darkSwitch === true) {
    $("link[rel=stylesheet]").attr({ href: "dark-style.css" });
  } else {
    $("link[rel=stylesheet]").attr({ href: "light-style.css" });
  }
}

//Function for showing/hiding answers table after quiz is completed
function showAnswersTable() {
  let answersTable = $(".answers-table");
  let showBtn = $(".show-answers-btn");

  if ($(showBtn).text() == "Hide Answers") {
    $(answersTable).hide();
    $(showBtn).text("Show Answers");
  } else {
    $(answersTable).show();
    $(showBtn).text("Hide Answers");
  }
}

//Function which fetches quiz from API
function fetchQuiz(topic) {
  let url;

  switch (topic) {
    case "sports":
      url =
        "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple";
      break;
    case "geography":
      url =
        "https://opentdb.com/api.php?amount=10&category=22&difficulty=easy&type=multiple";
      break;
    default:
      window.alert(
        "Couldn't load the requested quiz, please try a different one!"
      );
      break;
  }

  let request = new XMLHttpRequest();

  request.open("GET", url, true);
  request.onload = function () {
    const data = JSON.parse(this.response);
    const genre = data.results[0].category;
    const questions = [];

    const alternatives = data.results.map((record) => {
      const answers = record.incorrect_answers.map(
        (answer) => new Answer(answer)
      );
      answers.push(new Answer(record.correct_answer, true));
      shuffleArray(answers);

      const question = new Question(record.question, answers);
      questions.push(question);
    });

    quiz = new Quiz(genre, questions);

    displayQuizInformation();
    displayQuestion();
    implementButtons();
  };

  request.send();
}

function displayQuizInformation() {
  const { genre, currentQuestion, noOfQuestions } = quiz;

  $(".quiz-container").show();
  $(".results-container").hide();
  $(".welcome-container").hide();
  $(".quiz-title").text(genre + " Quiz");
  $(".page-info").text(
    "(" + (currentQuestion + 1) + " of " + noOfQuestions + ")"
  );
}

function displayQuestion() {
  const { questions, currentQuestion, noOfQuestions, selectedAnswers } = quiz;

  $(".quiz-question").html(questions[currentQuestion].text);
  $(".page-info").text(
    "(" + (currentQuestion + 1) + " of " + noOfQuestions + ")"
  );

  if (currentQuestion + 1 === noOfQuestions) {
    $(".next-btn").text("Submit Answers");
  } else {
    $(".next-btn").html('Next&nbsp;<i class="fa fa-angle-right"></i>');
  }

  for (let i = 0; i < $("input[name='answer']").length; i++) {
    let currentInput = $("input[name='answer']")[i];
    let correspondingSpan = $(".answer-span")[i];

    currentInput.value = questions[currentQuestion].alternatives[i].text;
    $(correspondingSpan).html(questions[currentQuestion].alternatives[i].text);

    if (selectedAnswers[currentQuestion] != null) {
      if (selectedAnswers[currentQuestion].text === currentInput.value) {
        $(currentInput).prop("checked", true);
      }
    } else {
      $(currentInput).prop("checked", false);
    }
  }
}

function implementButtons() {
  let { currentQuestion, noOfQuestions, selectedAnswers } = quiz;

  let nextBtn = $(".next-btn");
  let prevBtn = $(".prev-btn");

  nextBtn.unbind("click").click(function () {
    if (quiz.currentQuestion < noOfQuestions - 1) {
      selectedAnswers = saveAnswer();
      quiz.currentQuestion++;
      displayQuestion();
    } else {
      saveAnswer();

      let answeredAll = true;

      if (quiz.selectedAnswers.length === quiz.noOfQuestions) {
        for (let j = 0; j < quiz.selectedAnswers.length; j++) {
          if (quiz.selectedAnswers[j] == null) {
            answeredAll = false;
            break;
          }
        }
      } else {
        answeredAll = false;
      }

      if (answeredAll) {
        submitAnswers();
      } else {
        alert(
          "Please go back through and ensure you've selected an answer to every question before submitting"
        );
      }
    }
  });

  prevBtn.unbind("click").click(function () {
    if (quiz.currentQuestion > 0) {
      saveAnswer();
      quiz.currentQuestion--;
      displayQuestion();
    } else if (currentQuestion === 0) {
      alert("You're already on the first question");
    }
  });
}

function saveAnswer() {
  const { selectedAnswers, currentQuestion } = quiz;

  for (let i = 0; i < $("input[name='answer']").length; i++) {
    const currentInput = $("input[name='answer']")[i];
    if ($(currentInput).prop("checked")) {
      selectedAnswers[currentQuestion] = new Answer(currentInput.value);
    }
  }
}

function isCorrect(answer) {
  return answer.isCorrect === true;
}

function submitAnswers() {
  const { questions, selectedAnswers } = quiz;

  let noCorrect = 0;

  $(".answers-table").html(
    '<tr class="table-headers"><th>The Question:</th><th>Your Choice:</th><th>Correct Answer:</th><th>Result:</th></tr>'
  );

  for (let i = 0; i < selectedAnswers.length; i++) {
    const correctAnswer = questions[i].alternatives.find(isCorrect);

    if (
      selectedAnswers[i].text === correctAnswer.text &&
      correctAnswer.isCorrect
    ) {
      noCorrect++;
      formatFinalResults(true);
    } else {
      formatFinalResults(false);
    }

    function formatFinalResults(wasCorrect) {
      $(".answers-table").append(
        `<tr class="${!wasCorrect && "in"}correct-row">
        <td>${questions[i].text}</td>
        <td>${selectedAnswers[i].text}</td>
        <td>${correctAnswer.text}</td>
        <td>${wasCorrect ? "&#10003;" : "&#10007;"}</td>`
      );
    }
  }

  let feedback = "";

  if (noCorrect <= 1) {
    feedback = "Did you do the quiz with your eyes closed?";
  } else if (noCorrect <= 4) {
    feedback = "Not the best, but I know you can do better!";
  } else if (noCorrect <= 7) {
    feedback = "Good effort!";
  } else {
    feedback = "Woah, nicely done - that's a great score!";
  }

  $(".quiz-container").hide();
  $(".results-container").show();
  $(".result-header").text(feedback);
  $(".result-info").text(
    "You had " + noCorrect + " out of " + selectedAnswers.length + " correct"
  );
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
