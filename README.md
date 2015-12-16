# James Mason's Course Blog

This is a course blog for Code Fellows 301: Intermediate Software Development.

##Page and Article Naming Standards

1) Pages with multiple words in their title must separate words with _ .

Ex: Home Page => Home_Page


2) Pages and Articles must have unique titles.

Ex: If the About page exists, there can be no other About pages or any About articles.


##Context Templates For Pages

####Basic Page Context Template

{
  'title' : '',
  'content' : ''
}

####Reference Page Context Template

{
  'title' : '',
  'content' : '',
  'links' : [{
    linkTitle : '',
    linkUrl : ''
  }]
}

###Blog Articles Context Template

{
  'title' : '',
  'id' : '',
  'articles' : [{
    id : '',
    title : '',
    author : '',
    authorUrl : '',
    category : '',
    date : '',
    timePassed : '',
    content : ''
  }]
}

###Blog Article Filters Context Template

{
  'id' : '',
  'title' : '',
  'authors' : [{
    author : ''
  }],
  'categories' : [{
    category : 'ploop'
  }]
}

###Navigation Link Context Template

{
  'title' : '',
  'url' : '',
  'data' : ''
}

###Navigation Social Link Context Template

{
  'title' : '',
  'url' : '',
  'srcUrl' : '',
  'width' : '',
  'height' : '',
  'imgClass' : ''
}

###Author Statistic Context Template

{
  'author' : '',
  'averageWordLength' : ''
}
