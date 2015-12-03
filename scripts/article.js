var Article = function(props,container){
  this.author = props.author;
  this.authorUrl = props.authorUrl;
  this.title = props.title;
  this.content = props.body;
  this.publishedOn = props.publishedOn;
  this.category = props.category;
  this.DOM = container;
};
Article.prototype.toHTML = function()
{
  var container = this.DOM;
  $(container).find('.article-title h2').text(this.title);
  $(container).find('.article-author a').attr('href',this.authorUrl).text(this.author);
  $(container).find('.article-content').html(this.content);
  $(container).find('.article-category span').text('Category: '+this.category);
  var publishedDaysPassed = this.getPublishedDaysPast();
  var publicationInformation = $(container).find('.article-published-date span');
  if(publishedDaysPassed==1)
  {
    publicationInformation.first().text('Published yesterday, ');
  }
  if(publishedDaysPassed==0)
  {
    publicationInformation.first().text('Published today, ');
  }
  if(publishedDaysPassed>1)
  {
    publicationInformation.first().text('Published on ');
  }
  if(publishedDaysPassed<0)
  {
    publicationInformation.first().text('An article from the future, published on ');
  }
  var timeTag = $('<time></time>').attr('datetime',this.publishedOn).text(this.publishedOn);
  publicationInformation.first().append(timeTag);
  if(publishedDaysPassed>1)
  {
    publicationInformation.last().text(', '+publishedDaysPassed+' days ago...');
  } else {
    publicationInformation.last().remove();
  }
  return container;
};
Article.prototype.getPublishedDaysPast = function()
{
  var currentDate = new Date();
  var publishedDate = new Date(this.publishedOn);
  var daysPassed = Math.floor((currentDate.getTime() - publishedDate.getTime())/((3600*1000)*24)); //divided by 1 day in milliseconds.
  return daysPassed;
};
/*
Article.prototype.toHTML = function()
{
  var publishedDaysPassed = this.getPublishedDaysPast();
  var htmlOutput = '<article>' +
    '<div class="article-title"><h2>' + this.title + '</h2></div>' +
    '<div class="article-author article-meta-information"><span>Author: </span><a href="' + this.authorUrl + '" target="_blank" rel="author">' + this.author + '</a></div>' +
    '<div class="article-category article-meta-information"><span>Category: ' + this.category + '</span></div>' +
    '<div class="article-published-date article-meta-information"><span>Published: </span><time datetime="' + this.publishedOn + '">' + this.publishedOn + '</time>, ';
  if(publishedDaysPassed>1)
  {
    htmlOutput += (publishedDaysPassed+' days ago...');
  }
  if(publishedDaysPassed==1)
  {
    htmlOutput += 'Yesterday';
  }
  if(publishedDaysPassed==0)
  {
    htmlOutput += 'Today';
  }
  htmlOutput += '</div>' +
  '<div class="article-content">' + this.body + '</div>' +
  '</article>';
  return htmlOutput;
};
*/
