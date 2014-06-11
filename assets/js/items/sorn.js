var sorn = {

  // see server.rb - performance platform url
  urlUsers: '/sorn-users',
  urlSatisfaction: '/sorn-satisfaction',

  // array to hold 2 realtime user values
  usersCount: [],

  loadUsers: function() {
    // clear the users array
    sorn.usersCount.length = 0;
    loadUrl = sorn.urlUsers;
    $.ajax({
      dataType: 'json',
      cache: false,
      url: loadUrl,
      success: function(d) {
        sorn.populateUsers(d);
      }
    });
  },

  populateUsers: function(d) {
    var i, _i;
    for (i=0, _i=d.data.length; i<_i; i++) {
      sorn.usersCount.push(d.data[i].unique_visitors)
    }
    // update the display
    sorn.updateUsersDisplay();
  },

  updateUsersDisplay: function() {
    var r = getRandomInt(0, sorn.usersCount.length);
    $('.sorn .users-count').text(sorn.usersCount[r]);
  },

  loadSatisfaction: function() {
    loadUrl = sorn.urlSatisfaction;
    if (typeof offline !== 'undefined') {
      sorn.renderSatisfaction(satisfaction_json);
      return;
    }
    $.ajax({
      dataType: 'json',
      cache: false,
      url: loadUrl,
      success: function(d) {
        sorn.renderSatisfaction(d);
      }
    });
  },

};

var loadOffline = {

  startCounter: 0,

  initDisplay: function() {

    var now = new Date;
    now.setTime(Date.now());
    var hour = now.getHours();
    var min = now.getMinutes();
    var tempDate = new Date;

    // loop through the data set and match the time as closely as possible.
    for (var i = 0; i < d.length; i++) {
      tempDate.setTime(Date.parse(d[i]._timestamp));
      tempHour = tempDate.getHours();

      if (tempHour === hour) {
        tempMin = tempDate.getMinutes();
        if (tempMin === min) {
          loadOffline.startCounter = i;
          break;
        }
        // catch and go back 1 if we've shot over the nearest minutes
        if (tempMin > min) {
          loadOffline.startCounter = i-1;
          break;
        }
      }
    }

    // display the figure
    loadOffline.updateUsersDisplay(d[loadOffline.startCounter].unique_visitors);

    // and do the pie chart
    renderSatisfaction(satisfaction_json);

  },

  incrementUsers: function() {
    if (loadOffline.startCounter === d.length) {
      loadOffline.startCounter = 0;
    } else {
      loadOffline.startCounter++;
    }
    // display the updated figure
    loadOffline.updateUsersDisplay(d[loadOffline.startCounter].unique_visitors);
  },

  updateUsersDisplay: function(txt) {
    $('.users-count').text(addCommas(txt));
  }

};

var renderSatisfaction = function(d) {
  var percent = scoreToPercentage(d.data[d.data.length-1].satisfaction_sorn);
  $('.sorn .user-satisfaction').text(percent);
  var el = $('.sorn .user-satisfaction-pie');
  var measure = el.width() / 2;
  renderPie($('.sorn .user-satisfaction-pie').get(0), measure, measure, measure, [percent, 100 - percent], ["#fff", "transparent"], "#006435");
};

$(function() {
  if (typeof offline !== 'undefined') {

    d = sorn_users_json.data;

    loadOffline.initDisplay(d);

    // ...and simply increment once every 2 mins to (almost) match JSON data
    var update = window.setInterval(loadOffline.incrementUsers, 2*60*1000);

  } else {

    sorn.loadUsers();
    sorn.loadSatisfaction();
    // set up a "wobble"
    var sornWobble = window.setInterval(sorn.updateUsersDisplay, 10e3);
    // poll gov.uk once every 5 minutes
    var sornUpdate = window.setInterval(sorn.loadUsers, 300e3);

  }
});
