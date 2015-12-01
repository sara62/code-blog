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

Article.prototype.getPublishedDaysPast = function()
{
  var currentDate = new Date();
  var publishedDate = new Date(this.publishedOn); //creates a date object which is one day ahead of the reported date of publication listed in the blogArticles.js array.  Not sure why yet... :(
  var dayInMilliseconds = (3600*1000)*24; //1 day in milliseconds.
  var timePassed = currentDate - publishedDate - (3600*1000)*24; //minus one extra day to make it work right, cause... I donno why it drops a day.
  var daysPassed = Math.floor(timePassed/dayInMilliseconds);
  return daysPassed;
};
