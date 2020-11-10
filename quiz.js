//Function for switching which CSS file is used when user toggles dark/light mode
function darkMode() {

    var darkSwitch = $("#toggle-switch").is(":checked")

    if (darkSwitch === true) {
        $("link[rel=stylesheet]").attr({ href: "dark-style.css" });
    } else {
        $("link[rel=stylesheet]").attr({ href: "light-style.css" });
    }

    console.log(darkSwitch)
}

//Defining quiz and multiple subclasses of quiz to enable easier access to data
class Quiz {
    constructor(_genre, _noOfQuestions) {
        this.genre = _genre;
        this.noOfQuestions = _noOfQuestions;
    }
}

class Answers extends Quiz {
    constructor(_answers, _genre, _noOfQuestions) {
        super(_genre, _noOfQuestions);
        this.answers = _answers;
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

        //Creating a new quiz class and sending over genre and no of questions as parameters
        let currentQuiz = new Quiz(genre, noOfQuestions);

        //Creating answers and questions arrays for storing class instances
        let answersObjects = [];
        let questionObjects = [];

        //Looping through all the questions provided by API
        data.results.forEach(record => {

            //Creating temp answers array to pass as parameter for answers class
            let tempAnswers = [];
            for (let i = 0; i < record.incorrect_answers.length; i++) {
                tempAnswers.push(record.incorrect_answers[i]);
            }
            tempAnswers.push(record.correct_answer);

            //Creating new instance of questions class and passing it the records question as parameter
            //pushing new Question class instance to questions array
            let newQuestion = new Questions(record.question, genre, noOfQuestions);
            questionObjects.push(newQuestion);

            //Creating new instance of answers class and passing it the records answers as parameter
            //pushing new answers class instance to answers array
            let newAnswers = new Answers(tempAnswers, genre, noOfQuestions);
            answersObjects.push(newAnswers);
        });

        let currentQuestion = 0;

        //Displaying the information returned by 
        displayQuiz(answersObjects, questionObjects, genre, noOfQuestions, currentQuestion);
        implementButtons(answersObjects, questionObjects, noOfQuestions, currentQuestion);
    }

    //Sending request to fetch data
    request.send();
}


function displayQuiz(answersObjects, questionObjects, genre, noOfQuestions, currentQuestion) {

    $(".quiz-title").text(genre + " Quiz");
    $(".page-info").text("(" + (currentQuestion + 1) + " of " + noOfQuestions + ")");

    //move this to a separate function to be able to reuse this code within next and previous buttons???
    $(".quiz-question").text(questionObjects[currentQuestion].question);


    for (let i = 0; i < $("input[name='answer']").length; i++) {

        let currentInput = $("input[name='answer']")[i];
        let correspondingSpan = $(".answer-span")[i];
        console.log(answersObjects[currentQuestion].answers[i]);

        currentInput.value = answersObjects[currentQuestion].answers[i];
        correspondingSpan.textContent = answersObjects[currentQuestion].answers[i];
    }
}

function implementButtons(answersObjects, questionObjects, noOfQuestions, currentQuestion) {

    let nextBtn = $(".next-btn");
    let prevBtn = $(".prev-btn");


    nextBtn.click(function () {
        if(currentQuestion < noOfQuestions) {
            currentQuestion++;
            
            for (let i = 0; i < $("input[name='answer']").length; i++) {

                let currentInput = $("input[name='answer']")[i];
                let correspondingSpan = $(".answer-span")[i];
                console.log(answersObjects[currentQuestion].answers[i]);
        
                currentInput.value = answersObjects[currentQuestion].answers[i];
                correspondingSpan.textContent = answersObjects[currentQuestion].answers[i];
            }
        }
    });


}


/* Still to do -
       2. implement it so that jQuery inserts multiple questions using next/previous buttons
           2.1. if the question number is the same as the length of questions array, next should be submit

       3. implement it so that when a user submits an answer, it is saved in an array

       4. implement it so that the answer array is compared against the correcct answers

       5. implement a results box once user has submitted answers
    */