$(function() {
  //Declare helper objects.
  var ajaxObj = new AjaxHandler();
  var templates = new Templates(ajaxObj);
  //Set Article Data to Use
  var articleData = '';
  //Get Statistics
  var totalNumberOfArticles = articleData.length;
  var totalNumberOfWordsInArticles = articleData.map(getNumberOfWordsInMarkDownKey,'markdown').reduce(numberArrayAggregation);
  var totalNumberOfCharactersInArticles = articleData.map(getNumberOfCharactersInMarkDownKey,'markdown').reduce(numberArrayAggregation);
  var authors = _.uniq(articleData.map(getKey,'author'));
  var totalNumberOfAuthors = authors.length;
  var averageNumbeOfWordsInArticles = Math.round(totalNumberOfWordsInArticles / totalNumberOfArticles) + ' (± 1)';
  var averageWordLength = Math.round(totalNumberOfCharactersInArticles / totalNumberOfWordsInArticles) + ' (± 1)';
  var authorStatisticsContexts = [];
  authors.forEach(function(element,index,array) {
    var totalAuthorWords = articleData.map(getNumberOfWordsInAuthorMarkDown,element).reduce(numberArrayAggregation);
    var totalAuthorArticles = articleData.map(getAuthorArticles,element).reduce(numberArrayAggregation);
    var averageWordsPerArticle = Math.round(totalAuthorWords / totalAuthorArticles) + ' (± 1)';
    var percentageOfTotalArticlesWritten = Math.round((totalAuthorArticles / totalNumberOfArticles)*100) + '% (± 1)';
    var percentageOfTotalWordsWritten = Math.round((totalAuthorWords / totalNumberOfWordsInArticles)*100) + '% (± 1)';
    authorStatisticsContexts.push({'author' : element.toString(),'totalAuthorArticles' : totalAuthorArticles.toString(),'totalAuthorWords' : totalAuthorWords.toString(), 'averageWordsPerArticle' : averageWordsPerArticle.toString(), 'percentageOfTotalArticlesWritten' : percentageOfTotalArticlesWritten.toString(), 'percentageOfTotalWordsWritten' : percentageOfTotalWordsWritten.toString()});
  });
  //Set Statistics in HTML
  $('#total-articles').find('span').last().text(totalNumberOfArticles.toString());
  $('#total-authors').find('span').last().text(totalNumberOfAuthors.toString());
  $('#total-words').find('span').last().text(totalNumberOfWordsInArticles.toString());
  $('#total-characters').find('span').last().text(totalNumberOfCharactersInArticles.toString());
  $('#average-words-per-article').find('span').last().text(averageNumbeOfWordsInArticles.toString());
  $('#average-word-length').find('span').last().text(averageWordLength.toString());
  authors.forEach(function(element,index,array){
    var $authorStatisticsTemplate = templates.getTemplate('author-statistic');
    $authorStatisticsTemplate = templates.renderTemplate($authorStatisticsTemplate,authorStatisticsContexts[index]);
    $('#author-statistics').append($authorStatisticsTemplate);
  });
  //Helper Functions
  function getAuthorArticles(element,index,array) {
    if (array[index]['author'].toString() === this.toString()) {
      return 1;
    } else {
      return 0;
    }
  }
  function getNumberOfWordsInAuthorMarkDown(element,index,array) {
    if (array[index]['author'].toString() === this.toString()) {
      return getNumberOfWordsInMarkDown('markdown',index,array);
    } else {
      return 0;
    }
  }
  function getNumberOfWordsInMarkDown(key,index,array) {
    return marked(array[index][key]).replace(/(<([^>]+)>)/ig,'').split(' ').length;
  }
  function getNumberOfWordsInMarkDownKey(element,index,array) {
    //found the replace regex for stripping html tags here: http://stackoverflow.com/questions/7889765/remove-all-htmltags-in-a-string-with-the-jquery-text-function
    return marked(array[index][this]).replace(/(<([^>]+)>)/ig,'').split(' ').length;
  }
  function getNumberOfCharactersInMarkDownKey(element,index,array) {
    var words = marked(array[index][this]).replace(/(<([^>]+)>)/ig,'').split(' ');
    var characterCount = 0;
    words.forEach(function(e,i,a) {
      characterCount = characterCount + (e).replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,'').length;
    });
    return characterCount;
  }
  function getKey(element,index,array) {
    return array[index][this];
  }
  function numberArrayAggregation(previousValue, currentValue, currentIndex, array) {
    if (array.length > 0) {
      return previousValue + currentValue;
    } else {
      return 0;
    }
  }
});
