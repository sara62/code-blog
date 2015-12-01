var Article = function(props){
  this.author = props.author;
  this.authorUrl = props.authorUrl;
  this.title = props.title;
  this.body = props.body;
  this.publishedOn = props.publishedOn;
  this.category = props.category;
};

Article.prototype.toHTML = function()
{
  return '<article>' +
    '<div class="article-title"><h2>' + this.title + '</h2></div>' +
    '<div class="article-author article-meta-information"><span>Author: </span><a href="' + this.authorUrl + '" target="_blank" rel="author">' + this.author + '</a></div>' +
    '<div class="article-category article-meta-information"><span>Category: ' + this.category + '</span></div>' +
    '<div class="article-published-date article-meta-information"><span>Published: </span><time datetime="' + this.publishedOn + '">' + this.publishedOn + '</time></div>' +
    '<div class="article-content">' + this.body + '</div>' +
  '</article>';
};
