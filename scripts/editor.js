$(function() {
  $('#preview-container').hide();
  $('#json-container').hide();
  $('#editForm').submit(function(event){
    event.preventDefault();
    renderPreview();
    $('#preview-container').show();
    $('#json-container').show();
  });
  var renderPreview = function() {
    var templates = new Templates();
    var articleTitle = $('#title').val();
    var articleCategory = $('#category').val();
    var articleAuthor = $('#author').val();
    var articleAuthorUrl = $('#authorUrl').val();
    var articleContent = marked($('#content').val());
    articleContent = articleContent.replace(/'/g,'\\\'');
    articleContent = articleContent.replace(/\n/g, '<br>');
    var articleDate = new Date();
    var day = function() {
      if(articleDate.getDate()<10) {
        return ('0' + articleDate.getDate());
      } else {
        return articleDate.getDate();
      }
    }();
    articleDate = (articleDate.getFullYear() + '-' + (articleDate.getMonth()+1) + '-' + day);
    var $preview = templates.getTemplate('basic-articles');
    var context = {
      'title' : 'Articles',
      'id' : '0',
      'articles' : [{
        id : '0',
        title : articleTitle,
        author : articleAuthor,
        authorUrl : articleAuthorUrl,
        category : articleCategory,
        date : articleDate,
        timePassed : ' ',
        content : articleContent
      }]
    };
    $preview = templates.renderTemplate($preview,context);
    $('#preview').children().remove();
    $('#preview').append($preview).find('pre code').each(function(index,value) {
      hljs.highlightBlock(value);
    });
    var $articles = $('#Articles-0');
    $articles.find('article .article-content :not(:first-child)').hide();
    $articles.find('.read-more').show();
    $articles.find('article').show();
    $articles.on('click','.read-more',function() {
      $(this).parent().find('.article-content *').each(function(index,value) {
        $(value).show();
      });
      $(this).hide();
    });
    $articles.show();
    articleContent = $('.article-content').html();
    articleContent = articleContent.replace(/'/g,'\\\'');
    var json = '{title: \''+ articleTitle + '\', category: \''+ articleCategory + '\', author: \''+ articleAuthor+ '\', authorUrl: \''+ articleAuthorUrl +'\', date: \'' + articleDate + '\', content: \'' + articleContent + '\'},';
    $('#json').text(json);
  };
});
