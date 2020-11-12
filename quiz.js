//Function for switching which CSS file is used when user toggles dark/light mode
function darkMode() {

    var darkSwitch = $("#toggle-switch").is(":checked")

    if (darkSwitch === true) {
        $("link[rel=stylesheet]").attr({ href: "dark-style.css" });
    } else {
        $("link[rel=stylesheet]").attr({ href: "light-style.css" });
    }
}

//Defining quiz and multiple subclasses of quiz to enable easier access to data
class Quiz {
    constructor(_genre, _noOfQuestions) {
        this.genre = _genre;
        this.noOfQuestions = _noOfQuestions;
    }
}

class Answers extends Quiz {
    constructor(_answers, _genre, _noOfQuestions, _correctAnswer) {
        super(_genre, _noOfQuestions);
        this.answers = _answers;
        this.correctAnswer = _correctAnswer;
    }
}

class Questions extends Quiz {
    constructor(_question, _genre, _noOfQuestions) {
        super(_genre, _noOfQuestions);
        this.question = _question;
    }
}

class UsersAnswer extends Questions {
    constructor(_choice, _question) {
        super(_question);
        this.choice = _choice;
    }
}





function fetchQuiz(topic) {

    let url;

    switch (topic) {
        case 'sports':
            url = "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple";
            break;
        case 'geography':
            url = "https://opentdb.com/api.php?amount=10&category=22&difficulty=easy&type=multiple";
            break;
        default:
            window.alert("Couldn't load the requested quiz, please try a different one!");
            break;

    }

    //Creating new XMLHTTP request
    var request = new XMLHttpRequest();

    //Using GET request on the API and passing in the URL that is decided by the switch statement
    request.open('GET', url, true);
    request.onload = function () {

        //Parsing JSON response and assigning to data
        let data = JSON.parse(this.response);

        let genre = data.results[0].category;
        let noOfQuestions = data.results.length;

        //Creating answers and questions arrays for storing class instances
        let answersObjects = [];
        let questionObjects = [];

        
        let quiz = new Quiz(genre, noOfQuestions);

        //Looping through all the questions provided by API
        data.results.forEach(record => {

            //Creating temp answers array to pass as parameter for answers class
            let tempAnswers = [];
            for (let i = 0; i < record.incorrect_answers.length; i++) {
                tempAnswers.push(record.incorrect_answers[i]);
            }

            //Pushing correct answer to array too
            tempAnswers.push(record.correct_answer);

            tempAnswers = shuffleArray(tempAnswers);

            //Creating new instance of questions class and passing it the records question as parameter
            //pushing new Question class instance to questions array
            let newQuestion = new Questions(record.question, genre, noOfQuestions);
            questionObjects.push(newQuestion);

            //Creating new instance of answers class and passing it the records answers as parameter
            //pushing new answers class instance to answers array
            let newAnswers = new Answers(tempAnswers, genre, noOfQuestions, record.correct_answer);
            answersObjects.push(newAnswers);
        });

        let currentQuestion = 0;

        //Displaying the information returned by 
        displayQuizInformation(answersObjects, questionObjects, genre, noOfQuestions, currentQuestion);
        implementButtons(answersObjects, questionObjects, noOfQuestions, currentQuestion);
    }

    //Sending request to fetch data
    request.send();
}



//Function for displaying basic quiz the first time a new quiz is loaded
function displayQuizInformation(answersObjects, questionObjects, genre, noOfQuestions, currentQuestion) {

    $(".quiz-container").show();
    $(".results-container").hide();
    $(".welcome-container").hide();
    $(".quiz-title").text(genre + " Quiz");
    $(".page-info").text("(" + (currentQuestion + 1) + " of " + noOfQuestions + ")");

    let selectedAnswers = [];

    //Calling displayQuestion and passing over parameters that were given to this function - displaying first question
    displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers);
}





//Function for displaying the given question to the user
function displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers) {
    $(".quiz-question").html(questionObjects[currentQuestion].question);
    $(".page-info").text("(" + (currentQuestion + 1) + " of " + noOfQuestions + ")");

    if (currentQuestion + 1 === noOfQuestions) {
        $(".next-btn").text("Submit Answers");
    } else {
        $(".next-btn").html("Next&nbsp;<i class=\"fa fa-angle-right\"></i>");
    }


    for (let i = 0; i < $("input[name='answer']").length; i++) {

        let currentInput = $("input[name='answer']")[i];
        let correspondingSpan = $(".answer-span")[i];

        currentInput.value = answersObjects[currentQuestion].answers[i];
        $(correspondingSpan).html(answersObjects[currentQuestion].answers[i]);

        //Checking if user has already answered this question and if they have, marking their current answer as checked
        if (selectedAnswers[currentQuestion] != null) {
            if (selectedAnswers[currentQuestion].choice === currentInput.value) {
                $(currentInput).prop("checked", true);
            }
        } else {
            $(currentInput).prop("checked", false);
        }

    }
}





//Function for implementing the next and previous buttons
function implementButtons(answersObjects, questionObjects, noOfQuestions, _currentQuestion) {

    //Taking currentQuestion from the parameters and creating a new selectedAnswers array
    let currentQuestion = _currentQuestion;
    let selectedAnswers = [];

    let nextBtn = $(".next-btn");
    let prevBtn = $(".prev-btn");


    nextBtn.click(function () {
        console.log(selectedAnswers);
        console.log(currentQuestion);
        //WHEN CONSOLE LOGGING HERE, IF THIS IS THE SECOND QUIZ THE IS ANSWERING THEN THESE VARIABLES WILL DISPLAY TWO TIMES
        //ONCE WILL SHOW THE RESULTS FOR THE NEW QUIZ, AND ONCE THE RESULTS FOR THE OLD QUIZ. FOR EVERY NEW QUIZ, IT WILL DISPLAY
        //AGAIN, SO THREE QUIZZES = THREE RESULTS FOR EACH VARIABLE, FOUR = FOUR, ETC.

        if (currentQuestion < noOfQuestions - 1) {

            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);
            currentQuestion++;
            displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers);
        } else {
            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);

            let answeredAll = true;

            if (selectedAnswers.length === noOfQuestions) {
                for (let j = 0; j < selectedAnswers.length; j++) {
                    if (selectedAnswers[j] == null) {
                        answeredAll = false;
                        break;
                    }
                }
            } else {
                answeredAll = false;
            }

            if (!answeredAll) {
                alert("Please go back through and ensure you've selected an answer to every question before submitting");
            } else {
                submitAnswers(selectedAnswers, answersObjects);
            }
        }
    });

    prevBtn.click(function () {
        if (currentQuestion > 0) {
            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);
            currentQuestion--;
            displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers);
        } else if (currentQuestion === 0) {
            alert("You're already on the first question");
        }
    });

}

function saveAnswer(selectedAnswers, currentQuestion) {

    for (let i = 0; i < $("input[name='answer']").length; i++) {
        let currentInput = $("input[name='answer']")[i];

        if ($(currentInput).prop("checked") == true) {
            let userChoice = new UsersAnswer(currentInput.value);
            selectedAnswers[currentQuestion] = userChoice;
        }
    }

    return selectedAnswers;
}


function submitAnswers(selectedAnswers, answersObjects) {

    let noCorrect = 0;
    for (let i = 0; i < selectedAnswers.length; i++) {
        if (selectedAnswers[i].choice === answersObjects[i].correctAnswer) {
            noCorrect++;
        }
    }

    let feedback;

    switch (noCorrect) {
        case 0:
        case 1:
            feedback = "Did you do the quiz with your eyes closed?";
            break;
        case 2:
        case 3:
        case 4:
            feedback = "Not the best, but I know you can do better!";
            break;
        case 5:
        case 6:
        case 7:
            feedback = "Good effort!";
            break;
        case 8:
        case 9:
        case 10:
            feedback = "Woah, nicely done - that's a great score!";
            break;
        default:
            break;
    }

    $(".quiz-container").hide();
    $(".results-container").show();
    $(".result-header").text(feedback);
    $(".result-info").text("You had " + noCorrect + " out of " + selectedAnswers.length + " correct");
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


/* Still to do -
       8. fix so you can do multiple quizzes

       9. implement show results button which shows which questions you had right/wrong
    */