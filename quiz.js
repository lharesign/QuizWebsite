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

//Function for switching which CSS file is used when user toggles dark/light mode
function darkMode() {

    let darkSwitch = $("#toggle-switch").is(":checked")

    if (darkSwitch === true) {
        $("link[rel=stylesheet]").attr({ href: "dark-style.css" });
    } else {
        $("link[rel=stylesheet]").attr({ href: "light-style.css" });
    }
}

//Function for showing/hiding answers table after quiz is completed
function showAnswersTable() {
    console.log("show answers firing");

    let answersTable = $(".answers-table");
    let showBtn = $(".show-answers-btn");
    
    if ($(showBtn).text() == "Show Answers") {
        $(answersTable).show();
        $(showBtn).text("Hide Answers");
    } else {
        $(answersTable).hide();
        $(showBtn).text("Show Answers");
    }
}

//Function which fetches quiz from API
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
    let request = new XMLHttpRequest();

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

            //Calling shuffleArray in order to randomise the position of the correct answer within tempAnswers
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

        //Displaying the information returned by API
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

    //If on final question, change next button to contain "Submit Answers", otherwise "Next >"
    if (currentQuestion + 1 === noOfQuestions) {
        $(".next-btn").text("Submit Answers");
    } else {
        $(".next-btn").html("Next&nbsp;<i class=\"fa fa-angle-right\"></i>");
    }

    //Setting the value of the radio button and the html of the span within it
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

    //First unbinding (in case the user wants to take multiple quizzes) and then binding onclick events for next button
    nextBtn.unbind('click').click(function () {

        //If the current question is not the final question, saving the answer, incrementing currentQuestion and displaying the next question
        if (currentQuestion < noOfQuestions - 1) {

            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);
            currentQuestion++;
            displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers);
        } else {

            //If the current question is the final question, saving the answer
            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);

            //Setting answeredAll to true, we will change this if user has not answered all questions
            let answeredAll = true;

            //Checking SelectedAnswers.length is equal to the noOfQuestions, then looping through each answer checking for null values
            //if any of the answers stored are null, setting answeredAll to false and breaking out of the if statement. 
            if (selectedAnswers.length === noOfQuestions) {
                for (let j = 0; j < selectedAnswers.length; j++) {
                    if (selectedAnswers[j] == null) {
                        answeredAll = false;
                        break;
                    }
                }
            } else {
                //If SelectedAnswers.length is not equal to the noOfQuestions, user has not answered all questions
                answeredAll = false;
            }

            //If answeredAll is false, alert user that they need to go back through and answer every question
            //else calling the submitAnswers function
            if (!answeredAll) {
                alert("Please go back through and ensure you've selected an answer to every question before submitting");
            } else {
                submitAnswers(selectedAnswers, answersObjects, questionObjects);
            }
        }
    });

    //First unbinding (in case the user wants to take multiple quizzes) and then binding onclick events for next button
    prevBtn.unbind('click').click(function () {

        //If currentQuestion is greater than 0, saving answer, decrementing currentQuestion and displaying the previous question
        //else if currentQuestion is 0, we're on the first question so alerting to users that they can't go any further back
        if (currentQuestion > 0) {
            selectedAnswers = saveAnswer(selectedAnswers, currentQuestion);
            currentQuestion--;
            displayQuestion(answersObjects, questionObjects, currentQuestion, noOfQuestions, selectedAnswers);
        } else if (currentQuestion === 0) {
            alert("You're already on the first question");
        }
    });

}

//Function for savingAnswers, which is given the selectedAnswers array and currentQuestion as parameters
function saveAnswer(selectedAnswers, currentQuestion) {

//Loop through the input options, and check if the radio button for that input option is checked
//if it is, creating new instance of UsersAnswer and passing in that value
//setting that to it's corresponding position in the selectedAnswers array
    for (let i = 0; i < $("input[name='answer']").length; i++) {
        let currentInput = $("input[name='answer']")[i];
        if ($(currentInput).prop("checked") == true) {
            let userChoice = new UsersAnswer(currentInput.value);
            selectedAnswers[currentQuestion] = userChoice;
        }
    }

    //Returning selectedAnswers to it's caller
    return selectedAnswers;
}

//Function for submittingAnswers
function submitAnswers(selectedAnswers, answersObjects, questionObjects) {

    //Creating new variable to keep track of number of correct answer user has
    let noCorrect = 0;

    //Preparing the answers-table for receiving data
    $(".answers-table").html("<tr class=\"table-headers\"><th>The Question:</th><th>Your Choice:</th><th>Correct Answer:</th><th>Result:</th></tr>");
    
    //Looping through the selectedAnswers, creating new table rows and assigning class depending on whether user was correct or not
    //If user was correct, also incrementing noCorrect
    for (let i = 0; i < selectedAnswers.length; i++) {
        if (selectedAnswers[i].choice === answersObjects[i].correctAnswer) {
            noCorrect++;
            $(".answers-table").append("<tr class=\"correct-row\"><td>" + questionObjects[i].question + "</td><td>" + selectedAnswers[i].choice + "</td><td>" + answersObjects[i].correctAnswer + "</td><td>&#10003;</td></tr>");
        } else {
            $(".answers-table").append("<tr class=\"incorrect-row\"><td>" + questionObjects[i].question + "</td><td>" + selectedAnswers[i].choice + "</td><td>" + answersObjects[i].correctAnswer + "</td><td>&#10007;</td></tr>");
        }
    }

    //Creating new feedback variable
    let feedback;

    //Switch statement which chooses response based on users performance
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

    //Hiding the quiz container, displaying the results container, and setting the information within the results container
    $(".quiz-container").hide();
    $(".results-container").show();
    $(".result-header").text(feedback);
    $(".result-info").text("You had " + noCorrect + " out of " + selectedAnswers.length + " correct");
}

//Function for shuffling the temporary arrays of answers in order to randomise which position the correct answer is in
function shuffleArray(array) {

    //Loop through the items in the array, using Math.random() to shuffle the items within the array
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    //Returning shuffled array to caller
    return array;
}
