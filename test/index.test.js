var should  = require('should')
  , connect = require('connect')
  , Poll    = require(__dirname + '/../');

// Serve the fixtures.
connect()
  .use(connect.static(__dirname + "/fixtures"))
  .listen(4477);


var host = "http://127.0.0.1:4477"
  , feeds =
    [ host + "/atom.xml"
    , host + "/google-news.rss"
    ];


describe("feed-poll", function() {
  it("polls for articles", function(done) {
    var poll          = Poll(feeds)
      , article_count = 0;
    
    poll.on("article", function(article) {
      article.title.should.be.a("string");
      article_count++;
      if (article_count == 11) {
        poll.stop();
        done();
      }
    });
    
    poll.on("error", function(err) {
      poll.stop();
      done(err);
    });
    
    poll.start();
  });
  
  it("does not repeat articles", function(done) {
    var poll          = Poll(feeds, 0.5)
      , article_count = 0;
    
    poll.on("article", function(article) {
      article.title.should.be.a("string");
      article_count++;
      (article_count > 11).should.be.false;
      if (article_count == 11) {
        setTimeout(function() {
          poll.stop();
          done();
        }, 200);
      }
    });
    
    poll.start();
  });
});
