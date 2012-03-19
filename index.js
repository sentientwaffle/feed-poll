var EventEmitter = require('events').EventEmitter
  , feed         = require('feed-read')
  , _            = require('underscore');


// Public: Poll the list of feeds for updates.
// 
// feeds    - Array of String feed URLs (ATOM or RSS).
// interval - Polling interval in *seconds* (optional).
// 
// Returns FeedPoller.
var FeedPoll = module.exports = function(feeds, interval) {
  return new FeedPoller(feeds, interval || (60 * 60));
};



// Events:
// 
//   * cycle   - `()`
//   * article - `(article)`
//   * error   - `(err)`
// 
var FeedPoller = (function() {
  function FeedPoller(feeds, interval) {
    this.feeds    = feeds;
    this.interval = interval * 1000;
    this.emitter  = new EventEmitter();
    
    // The cache is {feed (String) : most recent published Date}
    this.cache    = {};
  }
  
  // Public: Attach an event. Same as EventEmitter#on.
  // 
  // Returns nothing.
  FeedPoller.prototype.on = function(event, callback) {
    this.emitter.on(event, callback);
  };
  
  // Public: Add an additional feed to poll.
  // 
  // feed - A feed URL (RSS or ATOM).
  // 
  // Returns nothing.
  FeedPoller.prototype.add = function(feed_url) {
    this.feeds.push(feed_url);
  };
  
  
  // Public: Stop polling.
  FeedPoller.prototype.stop = function() {
    clearInterval(this.interval_id);
  };
  
  
  // Internal: Start polling.
  FeedPoller.prototype.start = function() {
    var _this = this;
    _this.poll_all();
    this.interval_id = setInterval(function() {
      _this.poll_all();
    }, this.interval);
  };
  
  FeedPoller.prototype.poll_all = function() {
    this.emitter.emit("cycle");
    var _this = this;
    function next(i) {
      var feed = _this.feeds[i];
      if (!feed) return;
      _this.poll(feed, function() {
        next(i + 1);
      });
    }
    next(0);
  };
  
  // Internal: Poll the feed for updates.
  // 
  // callback - Called upon completion.
  // 
  FeedPoller.prototype.poll = function(feed_url, callback) {
    var _this = this;
    feed(feed_url, function(err, articles) {
      if (err)     _this.emitter.emit("error", err)
      if (articles) {
        var latest = _this.cache[feed_url]
          , art;
        
        articles = _.sortBy(articles, function(art) {
          return -art.published.getTime();
        });
        for (var i = 0; i < articles.length; i++) {
          art = articles[i];
          if (!latest || (art.published > latest)) {
            _this.emitter.emit("article", art);
            _this.cache[feed_url] = art.published;
          } else if (art.published > latest) {
            break;
          }
        }
      }
      callback();
    });
  };
  
  return FeedPoller;
})();

