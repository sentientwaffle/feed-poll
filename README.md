# Feed-poll
Poll for RSS or ATOM articles.

# Installation

    $ npm install feed-poll

# Usage

    var poll = require('feed-poll')(
    [ "http://feeds.feedburner.com/TechCrunch/"
    , "https://github.com/blog.atom"
    ]);
    
    poll.on("article", function(article) {
      console.log(article);
    });
    
    poll.start();

Handle errors:

    poll.on("error", function(err) {
      console.error(err);
    });


# License
See LICENSE.
