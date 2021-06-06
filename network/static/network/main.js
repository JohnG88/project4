const postsBox = document.getElementById('post-list');
const loadBtn = document.getElementById('load-btn');
const endBox = document.getElementById('end-box');

const postForm = document.getElementById('post-form');
const title = document.getElementById('id_content');
const alertBox = document.getElementById('alert-box');

const allProfileObjs = document.getElementById('all-profile-objs');
const profileBox = document.getElementById('profile-info');
const profileObjs = document.getElementById('profile-posts');

const profileName = document.getElementById('profile-name');
const mainBody = document.getElementById('main-body');

const allPosts = document.getElementById('all-posts');

const otherProfile = document.getElementById('get-other-profile');
const otherProfilePosts = document.getElementById('other-profile-posts');
const otherProfileStats = document.getElementById('other-profile-stats');

const followPosts = document.getElementById('f-posts');

/*
$('#profile-name').click(function() {
    $('#all-profile-objs').show();
    if ($('#main-body, #get-other-profile').is(':visible')) {
        $('#main-body, #get-other-profile').hide();
    }
});
*/

$('#all-posts').click(function() {
    $('#main-body').show();
    if ($('#all-profile-objs, #get-other-profile, #f-posts').is(':visible')) {
        $('#all-profile-objs, #get-other-profile, #f-posts').hide();
    }

    //$('#get-other-profile').load(" #get-other-profile");

    alertBox.innerHTML = '';
    otherProfileStats.innerHTML = '';
    otherProfilePosts.innerHTML = '';

    followPosts.innerHTML = '';
    profileBox.innerHTML = '';
    profileObjs.innerHTML = '';
});
/*
- Needed to take off quotes from middle of ids of if statement it is fixed now.

$('.other-profile-id').click(function() {
    $('#get-other-profile').show();
    if ($('#main-body, #all-profile-objs').is(':visible')) {
        $('#main-body, #all-profile-objs').hide();
    }
})
*/

/*
profileName.click(function() {
    profileBox.show(function() {
        if (mainBody.is(':visible')) {
            mainBody.hide();
        }
    })
})
*/



function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const likeUnlikePosts = () => {
    const likeUnlikeForms = [...document.getElementsByClassName('like-unlike-forms')]
    likeUnlikeForms.forEach(form => form.addEventListener('submit', e => {
        e.preventDefault();
        const clickedId = e.target.getAttribute('data-form-id');
        const clickedBtn = document.getElementById(`like-unlike-${clickedId}`);

        $.ajax({
            type: 'POST',
            url: 'like-unlike/',
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': clickedId,
            },
            success: function(response) {
                console.log(response)
                clickedBtn.textContent = response.likes ? `Unlike (${response.count})` : `Like (${response.count})`
            },
            error: function(error) {
                console.log(error)
            }
        })
    }))
}

// To fix the multiple form submissions, .off('submit').on('submit', ...), works
// On stackoverflow, it says: To only remove registered 'click' event handlers
const followUnfollowProfile = () => {
    //const followUnfollowForm = [...document.getElementById('follow-unfollow-form')];
    $(document).off('submit').on('submit', '#follow-unfollow-form', function(e) {
        e.preventDefault();
        e.stopPropagation();
        //e.target., this goes before getAttribute, trying to tweak some things around
        //const idClicked = e.target.getAttribute('data-follow-id');
        const idClicked = $(this).data('follow-id');
        const btnClicked = document.getElementById(`follow-unfollow-${idClicked}`);
        const changeCount = document.getElementById('change-count');
        console.log(idClicked);
        console.log(btnClicked);
        console.log(changeCount);
        
        $.ajax({
            type: 'POST',
            url: `update_follow/${idClicked}`,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'pk': idClicked,
            },
            success: function(response) {
                console.log(response);
                btnClicked.textContent = response.followers ? `Unfollow` : `Follow`;
                changeCount.textContent = response.count;

                /*
                if(btnClicked === `Unfollow`) {
                    changeCount.textContent = response.count - 1;
                } else {
                    changeCount.textContent = response.count + 1;
                }
                */
                //changeCount.textContent = response.count;
                
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
}


let visible = 3

const getData = () => {

    $.ajax({
        type: 'GET',
        url: `getAjax/${visible}`,
        success: function(response) {
            console.log(response);
            // The variable data below is assigned to the response of above and data from django view getAjax
            const data = response.data;
            console.log(data);
            data.forEach(el => {
                postsBox.innerHTML += `
                <div class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                    <a id="profile-link" class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p class="card-text">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" class="btn btn-primary">Details</a>
                            </div>
                            <div class="col">
                                <form class="like-unlike-forms" data-form-id="${el.id}">
                                    <button href="#" class="btn btn-primary" id="like-unlike-${el.id}">${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                `
            });
            likeUnlikePosts();
            // Line below gets posts_ser from django view
            //const data = JSON.parse(response.posts_ser);
            //console.log(data);
            //$('#postList').html(response);
    
            //${el.content} - <b>${el.created_date}</b> - <p>${el.creator}</p><br>
            // Line below pops out a 7 in console, size id s from django view getAjax
            console.log(response.size)
            // If size is 0 then add this quote to endBox 
            if (response.size === 0) {
                endBox.textContent = 'No posts added yet...'
            }
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            else if (response.size <= visible) {
                loadBtn.classList.add('not-visible')
                endBox.textContent = 'No more posts to load...'
            }
        },
        error: function(err) {
            console.log(err);
        }
    });
}

loadBtn.addEventListener('click', () => {
    visible += 3
    getData()
});

postForm.addEventListener('submit', e => {
    e.preventDefault();

    $.ajax({
        type: 'POST',
        url: "",
        data: {
            content: $('#id_content').val(),
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function(data) {
            console.log(data)
            postsBox.insertAdjacentHTML('afterbegin', `
                <div class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                        <a class="other-profile-id" data-id="${data.creator_id}" href="#"><h5 class="card-title">${data.creator}</h5></a>
                        <p class="card-text">${data.content}</p>
                        <p class="card-text">${data.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" class="btn btn-primary">Details</a>
                            </div>
                            <div class="col">
                                <form class="like-unlike-forms" data-form-id="${data.id}">
                                    <button href="#" class="btn btn-primary" id="like-unlike-${data.id}">Like (0)</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `)
            /*
            profileObjs.insertAdjacentHTML('afterbegin', `
            <div class="card mb-2" style="width: 18rem;">
            <div class="card-body">
                <a class="other-profile-id" data-id="${data.creator_id}" href="#"><h5 class="card-title">${data.creator}</h5></a>
                <p class="card-text">${data.content}</p>
                <p class="card-text">${data.created_date}</p>
            </div>
            <div class="card-footer">
                <div class="row">
                    <div class="col">
                        <a href="#" class="btn btn-primary">Details</a>
                    </div>
                    <div class="col">
                        <form class="like-unlike-forms" data-form-id="${data.id}">
                            <button href="#" class="btn btn-primary" id="like-unlike-${data.id}">Like (0)</button>
                        </form>
                    </div>
                </div>
            </div>
        </div> 
        `)
        */
            likeUnlikePosts();
            handleAlerts('success', 'New post added...')
            postForm.reset()
        },
        error: function(error) {
            console.log(error)
            handleAlerts('danger', 'oops....something went wrong')
        }
    });
    // Return false below stopped the duplicate from appearing when profile name was clicked in navbar
    // Perhaps not, commenting it out it still doesn't produce the duplicate
    // Idk why it started not producing duplicates, I'm going to restart laptop.
    // Something else fixed it.
    //return false;
});

const handleAlerts = (type, msg) => {

    alertBox.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${msg}
        </div>
    `
}
    
// .removeClass


//let toFollowLoaded = false;

//$('#profile-name').click(function() {
$('#profile-name').click(function(e) {
    //e.stopPropagation();
    e.preventDefault();
    //e.stopPropagation();
    $('#all-profile-objs').show();
    if ($('#main-body, #get-other-profile, #f-posts').is(':visible')) {
        $('#main-body, #get-other-profile, #f-posts').hide();
    }
    
    

    $.ajax({
        type: 'GET',
        url: 'profile_page',
        success: function(response) {
            console.log(response);
            const pfData = response.data;
            const posts = response.posts_obj;
            console.log(pfData);
            console.log(posts)

            /*
            if (!toFollowLoaded) {
            */

                
                profileBox.innerHTML += ` 
                <p>Profile: ${pfData.user}</p>
                <p>Followers: ${pfData.followers}</p>
                <p>Following: ${pfData.following}</p>
                `
                
                posts.forEach(ele => {
                    profileObjs.innerHTML += `
                        <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${ele.creator.name}</h5>
                            <p class="card-text">${ele.content}</p>
                            <p class="card-text">${ele.created_date}</p>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="#" class="btn btn-primary">Delete</a>
                                </div>
                                <div class="col">
                                    <form class="like-unlike-forms" data-form-id="${ele.id}">
                                        <button href="#" class="btn btn-primary" id="like-unlike-${ele.id}">${ele.likes ? `Unlike (${ele.count})` : `Like (${ele.count})`}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    `
                    
                });
            /*
            }
            
            toFollowLoaded = true;
            */
        },
        error: function(error) {
            console.log(error);
        }
    });
});

//let otherProfileBe = false;
// This is for a element .other-profile-id
$(document).off('click').on('click', '.other-profile-id', function(e) {
    
    // e.stopPropogation(); allows for innerHTML to be updated on click
    e.stopPropagation();
    e.preventDefault();
    //return false;
    //$('#get-other-profile').empty();
    $('#get-other-profile').show();
    if ($('#main-body, #all-profile-objs').is(':visible')) {
        $('#main-body, #all-profile-objs').hide();
    }
    
    //$('#get-other-profile').load(" #get-other-profile");
    
    //.data
    //var profileId = $(this).attr('data-id');
    //$('#get-other-profile').load(`other-profile/${profileId} #get-other-profile`);
    var profileId = $(this).data('id');
    //$('#get-other-profile').load( `other-profile/${profileId} #get-other-profile`);
    console.log(profileId);
    alert(profileId)

    $.ajax({
        type: 'GET',
        url: `other-profile/${profileId}`,
        cache: false,
        success: function(response) {
            console.log(response);
            const otherProfileData = response.single_profile_objs;
            const otherProfileInfo = response.single_profile_info;
            console.log(otherProfileData);
            console.log(otherProfileInfo);

            
            /*
            if (!otherProfileBe) {
            */
            /*
            if ($('#get-other-profile').is(':empty')) {
            */
                otherProfileStats.innerHTML +=`
                <div>Profile: ${otherProfileInfo.user}</div>
                <div>Followers: <span id="change-count">${otherProfileInfo.count}</span></div>
                <div>Following: ${otherProfileInfo.following}</div>

                <form id="follow-unfollow-form" data-follow-id="${otherProfileInfo.id}">
                    <button href="#" class="btn btn-primary" id="follow-unfollow-${otherProfileInfo.id}">${otherProfileInfo.followers ? `Unfollow` : `Follow`}</button>
                </form>
                `
                /*
                Donkey follows 2, followers 3
                Wango follows 2, followers 2
                Man follows 2, followers 3
                */
            

            
                otherProfileData.forEach(el => {
                    otherProfilePosts.innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                        <h5 class="card-title">${el.creator.name}</h5>
                            <p class="card-text">${el.content}</p>
                            <p class="card-text">${el.created_date}</p>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="#" class="btn btn-primary">Details</a>
                                </div>
                                <div class="col">
                                    <form class="like-unlike-forms" data-form-id="${el.id}">
                                        <button href="#" class="btn btn-primary" id="like-unlike-${el.id}">${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    `
                });
                followUnfollowProfile();
            
                /*
            } else {
                return false;
               // $('#other-profile-posts').empty();
            };
            */
            /*
            otherProfileBe = true;
            */
        },
        error: function(error) {
            console.log(error);
        }
    });
});

$('#follow_posts').click(function() {
    $('#f-posts').show();
    if ($('#main-body, #get-other-profile, #all-profile-objs').is(':visible')) {
        $('#main-body, #get-other-profile, #all-profile-objs').hide();
    }

    profileBox.innerHTML = '';
    profileObjs.innerHTML = '';

    $.ajax({
        type: 'GET',
        url: 'follow_posts',
        success: function(response) {
            console.log(response);
            const fPosts = response.followed_profiles_objs;
            console.log(fPosts)


            fPosts.forEach(el => {
                followPosts.innerHTML += `
                <div class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                    <h5 class="card-title">${el.creator.name}</h5>
                        <p class="card-text">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" class="btn btn-primary">Details</a>
                            </div>
                            <div class="col">
                                <form class="like-unlike-forms" data-form-id="${el.id}">
                                    <button href="#" class="btn btn-primary" id="like-unlike-${el.id}">${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                `
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
});



/*
function updateDiv() {
    $('#get-other-profile').load(location.href + ' #get-other-div');
}
*/

/*
social network part 9 has delete functionality
*/


//updateDiv();


getData();