$(function() {
  $('#preview-container').hide();
  $('#json-container').hide();
  if (localStorage.getItem('title') !== null) {
    $('#title').val(localStorage.getItem('title'));
  }
  if (localStorage.getItem('category') !== null) {
    $('#category').val(localStorage.getItem('category'));
  }
  if (localStorage.getItem('author') !== null) {
    $('#author').val(localStorage.getItem('author'));
  }
  if (localStorage.getItem('authorUrl') !== null) {
    $('#authorUrl').val(localStorage.getItem('authorUrl'));
  }
  if (localStorage.getItem('content') !== null) {
    $('#content').val(localStorage.getItem('content'));
  }
  $('#editForm').submit(function(event){
    event.preventDefault();
    renderPreview();
    $('#preview-container').show();
    $('#json-container').show();
  });
  $('#title').keyup(updateLocalStorage);
  $('#category').keyup(updateLocalStorage);
  $('#author').keyup(updateLocalStorage);
  $('#authorUrl').keyup(updateLocalStorage);
  $('#content').keyup(updateLocalStorage);
  function updateLocalStorage() {
    var articleTitle = $('#title').val();
    var articleCategory = $('#category').val();
    var articleAuthor = $('#author').val();
    var articleAuthorUrl = $('#authorUrl').val();
    var articleContent = $('#content').val();
    localStorage.setItem('title',articleTitle);
    localStorage.setItem('category',articleCategory);
    localStorage.setItem('author',articleAuthor);
    localStorage.setItem('authorUrl',articleAuthorUrl);
    localStorage.setItem('content',articleContent);
  }
  function renderPreview() {
    var ajax = new AjaxHandler();
    var templates = new Templates(ajax);
    updateLocalStorage();
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
    var $articles = $('#Articles-container');
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
  }
});
