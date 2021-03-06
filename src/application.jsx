/*globals $, React*/
(function(){
  var quizSubmission, orgPromoId, promoId, orgId, headers, Quiz, SubmitButton, QuestionList, Question,
    QuestionOptionsList, QuestionOption;

  //region Promotion Setup
  orgPromoId = 13854;
  promoId = 13854;
  orgId = 5403;

  headers = {
    'X-Organization-Promotion-Id': orgPromoId,
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Organization-Id': orgId,
    'X-Promotion-Id': promoId,
    'X-Api-Key': 65032887
  };
  //endregion

  //region React Components
  Quiz = React.createClass({

    //region React Lifecycle Hooks
    getInitialState: function() {
      return {questionData: [], outcomeData: null, submitError: null, loading: true};
    },
    componentDidMount: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        headers: headers,
        success: function(data) {
          this.setState({questionData: data});
          //Set up the quiz submission with initial data
          quizSubmission = {
            "quiz_submissions": [
              {
                "question_option_picks":[]
              }
            ]
          };
          data.questions.forEach(function(question){
            quizSubmission.quiz_submissions[0].question_option_picks.push({
              question_id: question.id,
              question_option_id: null,
              quiz_submission_id: null
            })
          });
          this.setState({loading: false});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    //endregion

    //region Custom Methods
    submitQuiz: function(qs){
      $.ajax({
        type: 'POST',
        url: 'https://embed-13854.secondstreetapp.com/api/quiz_submissions',
        dataType: 'json',
        data: qs,
        headers: headers,
        success: function(data) {
          this.getOutcomeById(data.quiz_submissions[0].outcome_id);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getOutcomeById: function(outcomeId){
      $.ajax({
        type: 'GET',
        url: 'https://embed-13854.secondstreetapp.com/api/outcomes/' + outcomeId,
        dataType: 'json',
        headers: headers,
        success: function(data) {
          this.setState({outcomeData: data.outcomes[0]});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    //endregion

    //region Render
    render: function(){
      var cx = React.addons.classSet;
      var appContentAreaClasses = cx({
        'ssAppContentArea': true,
        'ssLayoutDetermined': true,
        'ssLayoutMedium': window.innerWidth >= 640,
        'ssLayoutLarge': window.innerWidth >= 810
      });
      var calculateResults, retakeQuiz, errors, mainContent, headerText;
      calculateResults = function(){
        var isQuizComplete = !quizSubmission.quiz_submissions[0].question_option_picks.filter(function(pick){
          return !pick.question_option_id;
        }).length;
        if(isQuizComplete){
          this.submitQuiz(JSON.stringify(quizSubmission));
        }
        else {
          this.setState({submitError: 'You have not answered all questions'});
        }

      }.bind(this);

      retakeQuiz = function(){
        window.location.reload();
      };

      errors = this.state.submitError ? <p className="ssSubmissionError">{this.state.submitError}</p> : null;

      headerText = this.state.outcomeData ? 'Results' : 'Quiz';

      //If we're not loading, render the application with content
      if(!this.state.loading){

        //Determining what the main content should be based on what data is in state
        if(this.state.outcomeData){
          var description = this.state.outcomeData.description ? (<div className="ssTileContent">
            <p className="ssOutcomeDescription" dangerouslySetInnerHTML={{__html: this.state.outcomeData.description}}></p>
          </div>) : '';
          mainContent = (
            <div className="ssOutcome ssMainContent">
              <div className="ssOutcomeFeature ssTile">
                <h2 className="ssOutcomeHeader ssTileHeader" dangerouslySetInnerHTML={{__html: this.state.outcomeData.name}}></h2>
                {description}
              </div>
              <div className="ssOutcomeSecondary">
                <div className="ssOutcomeRetake ssTile">
                  <div className="ssTileContent">
                    <h3 className="ssOutcomePrompt">Not the result you expected?</h3>
                  </div>
                  <button className="ssButton ssButtonTileFooter ssButtonRetake" onClick={retakeQuiz}>
                  Retake Quiz
                  </button>
                </div>
              </div>
            </div>
          );
        }
        else {
          mainContent = (
            <div className="ssQuizInterior">
              <QuestionList data={this.state.questionData.questions}/>
              {errors}
              <SubmitButton submit={calculateResults}/>
            </div>
          );
        }

        //Now that we know what the main content is, render the application
        return (
          <div className={appContentAreaClasses}>
            <div className="ssQuiz">
              <div className="ssQuestionProgressCallout">
                <div className="ssQuestionProgressCalloutFeature">
                  <h2>{headerText}</h2>
                </div>
              </div>
              {mainContent}
            </div>
          </div>
        )
      }

      //If the application is in a loading state, just render the bones of it for a smoother load
      else {
        return (
          <div className={appContentAreaClasses}>
            <div className="ssQuiz">
              <div className="ssQuestionProgressCallout">
                <div className="ssQuestionProgressCalloutFeature">
                  <h2>{headerText}</h2>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
    //endregion
  });

  SubmitButton = React.createClass({

    //region Render
    render: function(){
      return (
        <button className="ssCalculateResultsButton ssButtonPrimary ssButton" onClick={this.props.submit}>Submit</button>
      )
    }
    //endregion

  });

  QuestionList = React.createClass({

    //region Render
    render: function(){
      var questionNodes;

      //If we have data (a list of questions) then sort it and build the html we're going to use as questionNodes
      if(this.props.data){
        this.props.data.sort(function(a, b){
          if (a.display_order < b.display_order){
            return -1;
          }
          if (a.display_order > b.display_order) {
            return 1;
          }
          return 0;
        });
        questionNodes = this.props.data.map(function (question) {
          return (
            <Question key={question.id} id={question.id} name={question.name} displayOrder={question.display_order} questionOptions={question.question_options}>
            </Question>
          );
        });
      }

      //Render each question inside of a container
      return (
        <div className="ssQuestions ssMainContent">
          {questionNodes}
        </div>
      )
    }
    //endregion

  });

  Question = React.createClass({

    //region Render
    render: function(){
      return (
        <div className="ssQuestion">
          <div className="ssQuestionHeader">
            <div className="ssVerticalCenterTable">
              <h2 className="ssVerticalCenterTableRow ssQuestionTitle">
                <span className="ssVerticalCenterTableData ssQuestionNumber">#{this.props.displayOrder}</span>
                <span className="ssVerticalCenterTableData ssQuestionName">{this.props.name}</span>
              </h2>
            </div>
          </div>
          <QuestionOptionsList data={this.props.questionOptions} questionId={this.props.id} />
        </div>
      )
    }
    //endregion

  });

  QuestionOptionsList = React.createClass({

    //region React Lifecycle Hooks
    getInitialState: function() {
      return {picked: null};
    },
    //endregion

    //region Render
    render: function(){
      var setPicked = function(qo){
        this.setState({picked: qo});
        var submissionPicks = quizSubmission.quiz_submissions[0].question_option_picks;
        var pickToChange = submissionPicks.filter(function(pick){
          return pick.question_id === this.props.questionId;
        }.bind(this))[0];
        pickToChange.question_option_id = qo.props.id;

      }.bind(this);
      this.props.data.sort(function(a, b){
        if (a.display_order < b.display_order){
          return -1;
        }
        if (a.display_order > b.display_order) {
          return 1;
        }
        return 0;
      });
      var questionOptionNodes = this.props.data.map(function (questionOption) {
        if(this.state.picked && this.state.picked.props.id === questionOption.id){
          return (
            <QuestionOption key={questionOption.id} id={questionOption.id} name={questionOption.name} displayOrder={questionOption.display_order} setPicked={setPicked} picked="true">
            </QuestionOption>
          )
        }
        return (
          <QuestionOption key={questionOption.id} id={questionOption.id} name={questionOption.name} displayOrder={questionOption.display_order} setPicked={setPicked}>
          </QuestionOption>
        );
      }.bind(this));
      return (
        <div className="ssQuestionOptions">
          <ul className="ssThumbnailGrid">
            {questionOptionNodes}
          </ul>
        </div>
      )
    }
    //endregion
  });

  QuestionOption = React.createClass({

    //region Render
    render: function(){
      var cx = React.addons.classSet;
      var classes = cx({
        'ssThumbnailGridSquare': true,
        'picked': this.props.picked
      });
      return (
        <li className="ssThumbnailGridItem ssClickable ssThumbnailGridItemTextOnly" onClick={function(){this.props.setPicked(this)}.bind(this)}>
          <a className={classes}>
            <div className="ssVerticalCenterTableContainer">
              <div className="ssVerticalCenterTable">
                <div className="ssVerticalCenterTableRow">
                  <div className="ssVerticalCenterTableData">
                    {this.props.name}
                  </div>
                </div>
              </div>
            </div>
          </a>
        </li>
      )
    }
    //endregion

  });
  //endregion

  //region Application Rendering
  React.render(
    <Quiz url="https://embed-13854.secondstreetapp.com/api/questions?sideloadSubObjects=false" />,
    document.getElementById('ssFrontApp')
  );
  //endregion

})();
