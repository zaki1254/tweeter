/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

const EMPTY_TWEET_CHAR_COUNT = 140;
const MAX_TWEET_CHAR_COUNT = 0;
/*
Creates an article for tweet object uses timeago to get
a friendly X days ago time frame
*/
const createTweetElement = (data) => {
  const newTweet = `
                    <article class="tweet">
                      <header class="tweet-header flex-container-row">
                        <div class="profile-pic-username flex-container-row">
                          <img src="${data.user.avatars}"/>
                          <p>${data.user.name}</p>
                        </div>
                        <p class="handle">${data.user.handle}</p>
                      </header>
                      <section class="tweet-content">
                        <p>${escape(data.content.text)}</p>
                      </section>
                      <footer>
                        <p class="time-created">${timeago.format(data.created_at)}</p>
                        <div>
                          <i class="fas fa-flag"></i>
                          <i class="fas fa-retweet"></i>
                          <i class="fas fa-heart"></i>
                        </div>
                      </footer>
                    </article>
                  `;
  return newTweet;
};
/*
Loops through tweet database object, uses createTweetElement() to generate an article
then appends the return value to the section #tweets-container
*/
const renderTweets = (data) => {
  for (let i = data.length - 1; i >= 0; i--) {
    const newTweet = createTweetElement(data[i]);
    $( '#tweets-container' ).append(newTweet);
  }
};
/*
renders the tweet passed to it as data
*/
const renderTweet = (data) => {
  const newTweet = createTweetElement(data);
  $( '#tweets-container' ).prepend(newTweet);
};
/* 
Makes get request to tweets database at /tweets
then uses renderTweets to loop through  the database
and render each tweet as an article.
*/
const loadTweets = () => {
  $.get('/tweets').then((data) => {
    renderTweets(data);
    $( '#tweet-text' ).val('');
  })
  .catch(err =>{
    console.log(err)
    newTweetError ("Error Loading Tweets" )
  })  
};
/* 
Makes get request to tweets database at /tweets
then uses renderTweet to render the most recent
tweet in the database
*/
const loadNewTweet = () => {
  $.get('/tweets').then((data) => {
    renderTweet(data[data.length - 1]);
    $( '#tweet-text' ).val('');
    $( 'output.counter' ).val(140);
  })
  .catch(err =>{
    console.log(err)
    newTweetError ("Error Loading Tweets" )
  })  
};
/* 
Function escapes the string inputted by the user to avoid any
XSS attacks before it is rendered on the page
*/
const escape = function (str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};
/*
Show error container and update the p element
to contain the inputted error message
*/
const newTweetError = (message) => {
  $( '#new-tweet-err-msg' ).text(message);
  $( '#new-tweet-error' ).show();
  $( '#tweet-text' ).focus();
};
/*
Hide error container and reset p to no text
*/
const closeNewTweetError = () => {
  $( '#new-tweet-error' ).hide();
  $( '#new-tweet-err-msg' ).text('');
};
/*
Toggle slideUp/SlideDown for create tweet section
shifts focus to form
*/
const toggleCreateTweet = () => {
  $( '#new-tweet-form' ).slideToggle();
  $( '#tweet-text' ).focus();
};

$( document ).ready(function() {
  /*
    Listen for click on nav "write new tweet" button
  */
  $( 'nav #compose-tweet-btn' ).click(function() {
    toggleCreateTweet();
  });
  /*
  Get tweets in database on page load
  */
  loadTweets();
  /*
  On new tweet form submit prevent default behaviour
  verify char amount is ok if not alert user
  use load tweets to get the database and then render them
  */
  $( '.new-tweet form' ).submit(function(event) {
    event.preventDefault();
    const tweetData = $( this ).serialize();
    const charCount = Number($( 'output.counter' ).val());
    // No characters in form
    if (charCount === EMPTY_TWEET_CHAR_COUNT) {
      // alert("Please enter a tweet before tweeting!");
      newTweetError('Please enter a tweet before tweeting!');
      return;
    // Max char count in form
    } else if (charCount < MAX_TWEET_CHAR_COUNT) {
      // alert("Please keep tweet within 140 characters in length!");
      newTweetError('Please keep tweet within 140 characters in length!')
      return;
    }
    // If char count is satisfied post the tweet to the database
    // Then render the most recent tweet at the top
    $.post('/tweets/', tweetData).then(() => {
      loadNewTweet();
      closeNewTweetError();
    })
    .catch(err =>{
      console.log(err)
      newTweetError ("Error Submitting Tweet" )
    })  
  });

});