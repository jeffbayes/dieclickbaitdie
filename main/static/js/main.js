
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

function getCurrentUrl() {
    sPageURL = '?';
    sPageURL += window.location.search.substring(1);
    return sPageURL;
}

$(document).ready( function () {

  /**
 * setup JQuery's AJAX methods to setup CSRF token in the request before sending it off.
 * http://stackoverflow.com/questions/5100539/django-csrf-check-failing-with-an-ajax-post-request
 */
 
function getCookie(name)
{
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
 
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}
 
$.ajaxSetup({ 
     beforeSend: function(xhr, settings) {
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     } 
});

  /*-----INDEX.HTML JAVASCRIPT-----*/
  /*-------------------------------*/
  //construct DataTable object with options
  var searchType = getUrlParameter('searchType');
  var resultsTable;
  if (searchType == "dishSearch") {
    resultsTable = $('#restaurant_table').DataTable( {
    paging: false,
    scrollY: 400,
    searching: false,
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [ 0,2,3 ] }
      ]
    });
    resultsTable.order([1, 'desc']).draw();
  } else {
    resultsTable = $('#restaurant_table').DataTable( {
    paging: false,
    scrollY: 400,
    searching: false,
    "ordering": false
    });
  }

  $('.star-search').raty({
      path: STATIC_URL+'/img/',

      score: function() {
        console.log($(this).attr('data-score'));
        return $(this).attr('data-score');
        },

      /*On click, determine which dish the user clicked, and what score they gave it. 
      Submit this score via an Ajax post request with 
      params: venue_id, dishName, and score*/
      click: function(score, evt) {
        var dishName = $(this).attr('dish_name');
        var venue_id = $(this).attr('venue_id');
        $.ajax({
           type:"POST",
           url: getCurrentUrl(),
           data: {
                  'venue_id': venue_id,
                  'dishName': dishName,
                  'score':    score
           },
           success: function(data){
               console.log('success...');
           }
        });
      }
    }); 

  //change placeholder text based on which search type is selected.
  $("input[value='dishSearch']" ).click(function() {
    $("input[name='searchQuery']").attr("placeholder", "Which Dish?");
  });
  $("input[value='restaurantSearch']" ).click(function() {
    $("input[name='searchQuery']").attr("placeholder", "Which Restaurant?");
  });



  /*---RESTAURANT.HTML JAVASCRIPT---*/
  /*-------------------------------*/
  $('#menu_table').DataTable( {
    paging: false,
    scrollY: 600,
    searching: false,
    "ordering": false,
    "oLanguage": {
        "sEmptyTable":     "Sorry, this restaurant does not have menu data!"
    }
  });

    //Configures display and behavior of rating star plugin.
    $('.star').raty({
      path: STATIC_URL+'/img/',

      score: function() {
        console.log($(this).attr('data-score'));
        return $(this).attr('data-score');
        },

      /*On click, determine which dish the user clicked, and what score they gave it. 
      Submit this score via an Ajax post request with 
      params: venue_id, dishName, and score*/
      click: function(score, evt) {
        parentNode = $(this).parent(); 
        parentHtml = parentNode.html();
        $(parentHtml).each(function(index, value) {
          $(value).each(function(i, j) {
            var className = $(j).attr('class');
            if (className == 'title') {
              var dishName = ($(j).html());
              var venue_id = document.getElementById('restaurant-id').innerHTML;
              $.ajax({
                 type:"POST",
                 url: '/'+venue_id+'/',
                 data: {
                        'venue_id': venue_id,
                        'dishName': dishName,
                        'score':    score
                 },
                 success: function(data){
                     console.log('success...');
                 }
            });
            }
          });
        });
      }
    });
});

