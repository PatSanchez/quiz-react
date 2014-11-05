(function(){
  var quizSubmission, orgPromoId, promoId, orgId, headers, Quiz, SubmitButton, QuestionList, Question,
    QuestionOptionsList, QuestionOption;

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

  Quiz = React.createClass({displayName: 'Quiz',
    getInitialState: function() {
      return {questionData: [], outcomeData: null, submitError: null, loading: true};
    },
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
    render: function(){
      var calculateResults = function(){
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
      var retakeQuiz = function(){
        window.location.reload();
      };
      var errors = this.state.submitError ? React.createElement("p", {className: "ssSubmissionError"}, this.state.submitError) : null;

      var mainContent;
      var headerText = this.state.outcomeData ? 'Results' : 'Quiz';
      if(!this.state.loading){
        if(this.state.outcomeData){
          var description = this.state.outcomeData.description ? (React.createElement("div", {className: "ssTileContent"}, 
            React.createElement("p", {className: "ssOutcomeDescription", dangerouslySetInnerHTML: {__html: this.state.outcomeData.description}})
          )) : '';
          mainContent = (
            React.createElement("div", {className: "ssOutcome ssMainContent"}, 
              React.createElement("div", {className: "ssOutcomeFeature ssTile"}, 
                React.createElement("h2", {className: "ssOutcomeHeader ssTileHeader", dangerouslySetInnerHTML: {__html: this.state.outcomeData.name}}), 
                description
              ), 
              React.createElement("div", {className: "ssOutcomeSecondary"}, 
                React.createElement("div", {className: "ssOutcomeRetake ssTile"}, 
                  React.createElement("div", {className: "ssTileContent"}, 
                    React.createElement("h3", {className: "ssOutcomePrompt"}, "Not the result you expected?")
                  ), 
                  React.createElement("button", {className: "ssButton ssButtonTileFooter ssButtonRetake", onClick: retakeQuiz}, 
                  "Retake Quiz"
                  )
                )
              )
            )
          );
        }
        else {
          mainContent = (
            React.createElement("div", {className: "ssQuizInterior"}, 
              React.createElement(QuestionList, {data: this.state.questionData.questions}), 
              errors, 
              React.createElement(SubmitButton, {submit: calculateResults})
            )
          );
        }
        return (
          React.createElement("div", {className: "ssAppContentArea ssLayoutMedium ssLayoutLarge ssLayoutDetermined"}, 
            React.createElement("div", {className: "ssQuiz"}, 
              React.createElement("div", {className: "ssQuestionProgressCallout"}, 
                React.createElement("div", {className: "ssQuestionProgressCalloutFeature"}, 
                  React.createElement("h2", null, headerText)
                )
              ), 
              mainContent
            )
          )
        )
      }
      else {
        return (
          React.createElement("div", {className: "ssAppContentArea ssLayoutMedium ssLayoutLarge ssLayoutDetermined"}, 
            React.createElement("div", {className: "ssQuiz"}, 
              React.createElement("div", {className: "ssQuestionProgressCallout"}, 
                React.createElement("div", {className: "ssQuestionProgressCalloutFeature"}, 
                  React.createElement("h2", null, headerText)
                )
              )
            )
          )
        )
      }
    }
  });

  SubmitButton = React.createClass({displayName: 'SubmitButton',
    render: function(){
      return (
        React.createElement("button", {className: "ssCalculateResultsButton ssButtonPrimary ssButton", onClick: this.props.submit}, "Submit")
      )
    }
  });

  QuestionList = React.createClass({displayName: 'QuestionList',

    render: function(){
      var questionNodes;
      if(this.props.data){ //Handle if the data hasn't loaded yet
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
            React.createElement(Question, {key: question.id, id: question.id, name: question.name, displayOrder: question.display_order, questionOptions: question.question_options}
            )
          );
        });
      }

      return (
        React.createElement("div", {className: "ssQuestions ssMainContent"}, 
          questionNodes
        )
      )
    }
  });

  Question = React.createClass({displayName: 'Question',
    render: function(){
      return (
        React.createElement("div", {className: "ssQuestion"}, 
          React.createElement("div", {className: "ssQuestionHeader"}, 
            React.createElement("div", {className: "ssVerticalCenterTable"}, 
              React.createElement("h2", {className: "ssVerticalCenterTableRow ssQuestionTitle"}, 
                React.createElement("span", {className: "ssVerticalCenterTableData ssQuestionNumber"}, "#", this.props.displayOrder), 
                React.createElement("span", {className: "ssVerticalCenterTableData ssQuestionName"}, this.props.name)
              )
            )
          ), 
          React.createElement(QuestionOptionsList, {data: this.props.questionOptions, questionId: this.props.id})
        )
      )
    }
  });

  QuestionOptionsList = React.createClass({displayName: 'QuestionOptionsList',
    getInitialState: function() {
      return {picked: null};
    },
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
            React.createElement(QuestionOption, {key: questionOption.id, id: questionOption.id, name: questionOption.name, displayOrder: questionOption.display_order, setPicked: setPicked, picked: "true"}
            )
          )
        }
        return (
          React.createElement(QuestionOption, {key: questionOption.id, id: questionOption.id, name: questionOption.name, displayOrder: questionOption.display_order, setPicked: setPicked}
          )
        );
      }.bind(this));
      return (
        React.createElement("div", {className: "ssQuestionOptions"}, 
          React.createElement("ul", {className: "ssThumbnailGrid"}, 
            questionOptionNodes
          )
        )
      )
    }
  });

  QuestionOption = React.createClass({displayName: 'QuestionOption',
    render: function(){
      var cx = React.addons.classSet;
      var classes = cx({
        'ssThumbnailGridSquare': true,
        'picked': this.props.picked
      });
      return (
        React.createElement("li", {className: "ssThumbnailGridItem ssClickable ssThumbnailGridItemTextOnly", onClick: function(){this.props.setPicked(this)}.bind(this)}, 
          React.createElement("a", {className: classes}, 
            React.createElement("div", {className: "ssVerticalCenterTableContainer"}, 
              React.createElement("div", {className: "ssVerticalCenterTable"}, 
                React.createElement("div", {className: "ssVerticalCenterTableRow"}, 
                  React.createElement("div", {className: "ssVerticalCenterTableData"}, 
                    this.props.name
                  )
                )
              )
            )
          )
        )
      )
    }
  });

  React.render(
    React.createElement(Quiz, {url: "https://embed-13854.secondstreetapp.com/api/questions?sideloadSubObjects=false"}),
    document.getElementById('ssFrontApp')
  );
})();
