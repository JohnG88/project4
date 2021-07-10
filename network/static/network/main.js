const user_id = JSON.parse(document.getElementById('user_id').textContent);
console.log(user_id)
const postsBox = document.getElementById('post-list');
const loadBtn = document.getElementById('load-btn');
const endBox = document.getElementById('end-box');

const postForm = document.getElementById('post-form');
const editPostForm = document.getElementById('edit-post-form');
const title = document.getElementById('id_content');
const alertBox = document.getElementById('alert-box');

const allProfileObjs = document.getElementById('all-profile-objs');
const profileBox = document.getElementById('profile-info');
const profileObjs = document.getElementById('profile-posts');

const profileName = document.getElementById('profile_name');
const profileNameAttr = document.getElementById('profile_name').getAttribute('data-id');
console.log('Current user id ' + profileNameAttr);
const mainBody = document.getElementById('main-body');

const allPosts = document.getElementById('all-posts');

const otherProfile = document.getElementById('get-other-profile');
const otherProfilePosts = document.getElementById('other-profile-posts');
const otherProfileStats = document.getElementById('other-profile-stats');
const profileEndBox = document.getElementById('profile-end-box');
const profileLoadButton = document.getElementById('profile-load-btn');

const followPosts = document.getElementById('f-posts-body');
const followEndBox = document.getElementById('follow-end-box');
const followLoadBtn = document.getElementById('follow-load-button');

const modalBody = document.getElementById('m-body');
const mainModal = document.getElementById('exampleModal');
const modalBodyLabel = document.getElementById('exampleModalLabel');
const modalSubmitFooter = document.getElementById('submit-footer')


window.onclick = function(event) {
    if (event.target == mainModal) {
        modalBody.innerHTML = '';
    }
}

$('#close-x').click(function() {
    modalBody.innerHTML = '';
})

//$('#follow-load-btn').hide();

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
    $('#profile-load-btn').hide();
    //$('#get-other-profile').load(" #get-other-profile");

    alertBox.innerHTML = '';
    otherProfileStats.innerHTML = '';
    otherProfilePosts.innerHTML = '';

    //followPosts.innerHTML = '';
    //profileBox.innerHTML = '';
    //profileObjs.innerHTML = '';
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
        });
        e.stopImmediatePropagation();
        return false;
    }));
};

// To fix the multiple form submissions, .off('submit').on('submit', ...), works
// On stackoverflow, it says: To only remove registered 'click' event handlers
const followUnfollowProfile = () => {
    //const followUnfollowForm = [...document.getElementById('follow-unfollow-form')];
    $(document).off('submit').on('submit', '#follow-unfollow-form', function(e) {
        e.preventDefault();
        //e.stopPropagation();
        //e.target., this goes before getAttribute, trying to tweak some things around
        //const idClicked = e.target.getAttribute('data-follow-id');
        const idClicked = $(this).data('follow-id');
        const btnClicked = document.getElementById(`follow-unfollow-${idClicked}`);
        const changeCount = document.getElementById('change-count');
        console.log(idClicked);
        console.log(btnClicked);
        console.log(changeCount);
        
        /*
        if(idClicked === profileNameAttr) {
            $('#follow-unfollow-form').hide();
        } else {
            $('#follow-unfollow-form').show();
        }
        */
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

                followPosts.innerHTML = '';
                

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

// Used .one here because it was firing multiple times when edit button was clicked.
// .one only works to stop button from firing multiple times, bt never updates.
// Adding  e.stopImmediatePropagation(); and return false; at end of error function works for it to not fire multiple times but also lets update, maybe because it is a function in a function.

const getPost = () => {
    //$('.ePost').click(function(e) {
    $(document).on('click', '.ePost', function(e) {
    //editPostForm.addEventListener('submit', e => {
        //e.preventDefault();
        //e.stopPropagation();
        
        var postId = $(this).data('post-id')
        console.log('This is post id ' + postId);

        
        
        $.ajax({
            type: 'GET',
            url: `get_post/${postId}`,
            success: function(postData) {
                console.log('This is post data ' + postData.id);
                modalBodyLabel.innerHTML = `
                    ${postData.creator}
                `
                /*
                modalBody.innerHTML = `
                    <input type="text" class="input-id" name="edit-content-input">
                `
                */

                modalBody.innerHTML += `
                <form method="post" id="edit-post-form" data-edit-form-id="${postData.id}">
                    <input type="text" class="input-id" name="edit-content-input">
                
                    <div class="modal-footer" id="submit-footer">
                        <input id="submit-footer-btn" type="submit" class="btn btn-primary save-edit-button" data-id="${postData.id}" value="Save Edit">
                    </div>
                </form>
                `

                $('.input-id').val(`${postData.content}`)

                editOnlyPost();
            },
            error: function(error) {
                console.log(error);
            }
        
        });
        e.stopImmediatePropagation();
        return false;
        
    });
};


const editOnlyPost = () => {
    $(document).on('submit', '#edit-post-form', function(e) {
    //editPostForm.addEventListener('submit', e => {
        e.preventDefault();
        //modalBody.innerHTML = '';
        const editPostId = $(this).data('edit-form-id');
        //const editPostId = $(this).data('post-id')
        const editContent = $('.input-id').val()
        //const oldContent = getElementById('old-content')
        console.log('This id of post ' + editPostId);
        console.log('This is new content ' + editContent)
        $.ajax({
            type: 'POST',
            url: `update_post/${editPostId}`,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'content': editContent,
                //'pk': editPostId,
            },
            success: function(response) {
                console.log('This is updated post ' + response.id);
                console.log('This is from edit button id ' + editPostId)
                // to stop duplicating divs in modal
                modalBody.innerHTML = '';
                // To hide modal on submit
                $('#exampleModal').modal('hide');
                
                // Add a dynamic id to element to change that element, in this case, `content-update-${response.id}` is from p element that holds ${el.content} from getData function in postsBox.innerHTML
                document.getElementById(`content-update-${response.id}`).innerHTML = response.content;
                
                
                
                //getPostContentId.getAttribute('data-id-content').innerHTML = response.content;

                //document.getElementById('old-content').innerHTML = response.content;
                
            },
            error: function(error) {
                console.log(error)
            }
        });
        e.stopImmediatePropagation();
        return false;
    });
}

const getDeletePost = () => {
    $(document).on('click', '.deleteP', function(e) {
        //e.preventDefault();
        const postId = $(this).data('post-id')
        console.log('This is post id ' + postId);

        $.ajax({
            type: 'GET',
            url: `get_post/${postId}`,
            success: function(postData) {
                console.log('This is post data ' + postData.id);
                modalBodyLabel.innerHTML = `
                    ${postData.creator}
                `
                /*
                modalBody.innerHTML = `
                    <input type="text" class="input-id" name="edit-content-input">
                `
                */

                modalBody.innerHTML += `
                <form method="post" id="delete-post-form" data-delete-form-id="${postData.id}">
                    <p>Are you sure you wish to delete this post ${postData.id}</p>
                
                    <div class="modal-footer" id="submit-footer">
                        <input id="submit-footer-btn" type="submit" class="btn btn-primary delete-post-button" data-id="${postData.id}" value="Delete Post">
                    </div>
                </form>
                `

                deletePost();
            },
            error: function(error) {
                console.log(error);
            }
        });
        e.stopImmediatePropagation();
        return false;
    });
};

/*
<form method="post" id="delete-post-form" data-delete-form-id="${ele.id}">
                                        <button href="#" class="btn btn-primary">Delete</button>
                                    </form>
*/

const deletePost = () => {
    $(document).on('submit', '#delete-post-form', function(e) {
        e.preventDefault();
        const deletePostId = $(this).data('delete-form-id');
        /*
        $(document).on('click', '.delete-post-button', function() {
            const postIdFade = document.getElementById(`delete-card-id-${deletePostId}`)
                postIdFade.fadeOut(2000);
        })
        */
        $(`#delete-card-id-${deletePostId}`).fadeOut(2000);

        console.log('This is delete post id ' + deletePostId);

        $.ajax({
            type: 'POST',
            url: `delete_post/${deletePostId}`,
            data: {
                'csrfmiddlewaretoken': csrftoken,
            },
            success: function(response) {
                //const postIdFade = $(document).getElementById(`delete-card-id-${deletePostId}`)
                //postIdFade.fadeOut(2000);
                //$(`#delete-card-id-${deletePostId}`).fadeOut(2000);
                //document.getElementById(`delete-card-id-${deletePostId}`).remove();
                //remove();
                modalBody.innerHTML = '';
                $('#exampleModal').modal('hide');
                
                /*
                $(document).on('click', '#submit-footer-btn', function() {
                    $(`#delete-card-id-${deletePostId}`).fadeOut(2000);
                })
                */
            },
            error: function(error) {
                console.log(error);
            }
        });
        e.stopImmediatePropagation();
        return false;
    });
};

let visible = 3

const getData = () => {
    $.ajax({
        type: 'GET',
        url: `getAjax/${visible}`,
        success: function(response) {
            console.log(response);
            // The variable data below is assigned to the response of above and data from django view getAjax
            const data = response.data;
            console.log('This is 3 per click posts ' + data);
            const dataName = response.data.name

            data.forEach(el => {
                postsBox.innerHTML += `
                <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                    <a id="other-profile-ids" class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p id="content-update-${el.id}" class="card-text c-t">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="editP" class="btn btn-primary ePost" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Edit</a>
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
                
            
            getPost();
            likeUnlikePosts();
            
            // Line below gets posts_ser from django view
            //const data = JSON.parse(response.posts_ser);
            //console.log(data);
            //$('#postList').html(response);
    
            //${el.content} - <b>${el.created_date}</b> - <p>${el.creator}</p><br>
            // Line below pops out a 7 in console, size id s from django view getAjax
            console.log('This for all posts ' + response.size)
            // If size is 0 then add this quote to endBox 
            if (response.size === 0) {
                endBox.textContent = 'No posts added yet...'
            }
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            else if (response.size <= visible) {
                //loadBtn.classList.add('not-visible')
                $('#load-btn').hide();
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
    getData();
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
                <div id="delete-card-id-${data.id}" class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                        <a id="other-profile-ids" class="other-profile-id" data-id="${data.creator_id}" href="#"><h5 class="card-title">${data.creator}</h5></a>
                        <p id="content-update-${data.id}" class="card-text">${data.content}</p>
                        <p class="card-text">${data.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="editP" class="btn btn-primary ePost" data-toggle="modal" data-target="#exampleModal" data-post-id="${data.id}">Edit</a>
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
            otherProfilePosts.insertAdjacentHTML('afterbegin', `
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
            getPost();
            handleAlerts('success', 'New post added...')
            postForm.reset()
            $('#alert-box').fadeOut(6000);
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

//const getProName = document.querySelectorAll('.other-profile-id')
//console.log('dataset '+ getProName.dataset.id)

/*
let profileVisible = 3
const getProfiles = () => {
    //const profileId = $('.other-profile-id').attr('data-id');
    $(document).on('click', '#other-profile-ids', function(e) {
    //e.preventDefault();
        var profileId = $(this).data('id');
        //var profileClass = document.getElementsByClassName('other-profile-id');
        //var profileId = profileClass.attr('data-id');

        //$('#get-other-profile').load( `other-profile/${profileId} #get-other-profile`);
        console.log(profileId);
        //alert(profileId)
        
        $.ajax({
            type: 'GET',
            url: `other-profile/${profileVisible}`,
            cache: false,
            //data: {
                //id: profileId,
            //},
            success: function(response) {
                console.log(response);
                const otherProfileData = response.single_profile_objs;
                //const otherProfileInfo = response.single_profile_info;
                console.log(otherProfileData);
                //console.log(otherProfileInfo);

                
                /*
                if (!otherProfileBe) {
                */
                
                //if ($('#get-other-profile').is(':empty')//) {

                
                    
                    /*
                    otherProfileStats.innerHTML +=`
                    <div>Profile: ${otherProfileInfo.user}</div>
                    <div>Followers: <span id="change-count">${otherProfileInfo.count}</span></div>
                    <div>Following: ${otherProfileInfo.following}</div>
                    
                    
                    <form id="follow-unfollow-form" data-follow-id="${otherProfileInfo.id}">
                        <button href="#" class="btn btn-primary" id="follow-unfollow-${otherProfileInfo.id}">${otherProfileInfo.followers ? `Unfollow` : `Follow`}</button>
                    </form>
                    `
                    */
                    
                    
                    //Donkey follows 2, followers 3
                    //Wango follows 2, followers 2
                    //Man follows 2, followers 3
                    
                

                    /*
                    otherProfileData.forEach(el => {
                        otherProfilePosts.innerHTML += `
                        <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                            <div class="card-body">
                            <h5 class="card-title">${el.creator.name}</h5>
                                <p class="card-text">${el.content}</p>
                                <p class="card-text">${el.created_date}</p>
                            </div>
                            <div class="card-footer">
                                <div class="row">
                                    <div class="col">
                                        <a href="#" id="delete-post-link" class="btn btn-primary deleteP" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Delete</a>
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
                    likeUnlikePosts();
                    getDeletePost();
                
                    /*
                    if(otherProfileInfo.id === user_id) {
                        $('#follow-unfollow-form').hide();
                    } else {
                        $('#follow-unfollow-form').show();
                    };
                    */
                    
                    

                    
                //} else {
                    //return false;
                // $('#other-profile-posts').empty();
                //};
                
                
                //otherProfileBe = true;
                /*
                if (response.size === 0) {
                    profileEndBox.textContent = 'No posts added yet...'
                }
                // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
                else if (response.size <= profileVisible) {
                    profileLoadButton.classList.add('not-visible')
                    profileEndBox.textContent = 'No more posts to load...'
                }
                setTimeout(() => {
                    $('#profile-load-btn').show();
                }, 500);

            },
            error: function(error) {
                console.log(error);
            }
        });
        e.stopImmediatePropagation();
        return false;
    });
};
*/
/*
profileLoadButton.addEventListener('click', () => {
    console.log("Profile Click")
    profileVisible += 3
    getProfiles();
})
*/
/*
$('body').on('click', '#profile-load-btn', function() {
    profileVisible += 3
    getProfiles();
});
*/

//let otherProfileBe = false;
// This is for a element .other-profile-id
//$(document).on('click', '.other-profile-id', function() {
//let toProfileLoaded = false;

//const otherProfileName = document.querySelectorAll('.other-profile-id')
//document.addEventListener('click', e => {
    //if (e.target.matches('.other-profile-id')) {
//otherProfileName.forEach(proName => {
    //proName.addEventListener('click', () => {
let otherOtherVisible = 3

$('body').on('click', '.other-profile-id', function() {
        
        // e.stopPropogation(); allows for innerHTML to be updated on click
        //e.stopPropagation();
        //e.preventDefault();
        //return false;
        //$('#get-other-profile').empty();
        $('#get-other-profile').show();
        if ($('#main-body, #f-posts').is(':visible')) {
            $('#main-body, #f-posts').hide();
        }
        var profileId = $(this).data('id');
        //const profileId = $('.other-profile-id').data('id');
        //const profileId = profileVar.d

        //var profileId = $(this).data('id');
        
        //getProfiles();
        //profileLoadButton.addEventListener('click', () => {
            //visible += 3
            //getProfiles();
        //});

        //$('#follow-load-btn').hide();
        
        //$('#profile-load-btn').show();

        //followPosts.innerHTML = '';

        //$('#get-other-profile').load(" #get-other-profile");
        
        //.data
        //var profileId = $(this).attr('data-id');
        //$('#get-other-profile').load(`other-profile/${profileId} #get-other-profile`);
        
        //var profileId = $(this).data('id');
        //$('#get-other-profile').load( `other-profile/${profileId} #get-other-profile`);
        //console.log(profileId);
        //alert(profileId)
        
        $.ajax({
            type: 'GET',
            url: 'other-profile',
            //cache: false,
            data: {
                id: profileId,
            },
            success: function(response) {
                console.log(response);
                const otherProfileData = response.single_profile_objs;
                const otherProfileInfo = response.single_profile_info;
                console.log(otherProfileData);
                console.log(otherProfileInfo);

                
                
                //if (!toProfileLoaded) {
                    
                    otherProfileStats.innerHTML +=`
                    <div>Profile: ${otherProfileInfo.user}</div>
                    <div>Followers: <span id="change-count">${otherProfileInfo.count}</span></div>
                    <div>Following: ${otherProfileInfo.following}</div>
                
                    
                    <form id="follow-unfollow-form" data-follow-id="${otherProfileInfo.id}">
                        <button href="#" class="btn btn-primary" id="follow-unfollow-${otherProfileInfo.id}">${otherProfileInfo.followers ? `Unfollow` : `Follow`}</button>
                    </form>
                    `
                    
                    //getProfiles();
                    /*
                    //Donkey follows 2, followers 3
                // Wango follows 2, followers 2
                    //Man follows 2, followers 3
                    */
                

                    
                    otherProfileData.forEach(el => {
                        otherProfilePosts.innerHTML += `
                        <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                            <div class="card-body">
                            <h5 class="card-title">${el.creator.name}</h5>
                                <p class="card-text">${el.content}</p>
                                <p class="card-text">${el.created_date}</p>
                            </div>
                            <div class="card-footer">
                                <div class="row">
                                    <div class="col">
                                        <a href="#" id="delete-post-link" class="btn btn-primary deleteP" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Delete</a>
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
                    likeUnlikePosts();
                    getDeletePost();
                    
                    //getProfiles();
                    
                    if(otherProfileInfo.id === user_id) {
                        $('#follow-unfollow-form').hide();
                    } else {
                        $('#follow-unfollow-form').show();
                    };
                    
                    
                    //setTimeout(() => {
                        //$('#profile-load-btn').show();
                    //}, 500);
                    

                    
                    //$('#profile-load-btn').show();
                    //profileLoadButton.addEventListener('click', () => {
                        //profileVisible += 3
                        //getProfiles();
                    //});
                    
                    /*
                    //$('#profile-load-btn').click(function() {
                    //    visible += 3
                    //})
                
                    
                //} else {
                    //return false;
                // $('#other-profile-posts').empty();
                
                //};
                
                
                //toProfileLoaded = true;
                
                //otherProfile.innerHTML = '';
                */
            },
            error: function(error) {
                console.log(error);
            }
            
    });
});



/*
$('body').on('click', '#profile-load-btn', function() {
    profileVisible += 3
    getProfiles()
});
*/
/*
//profileName.onClick(function() {
$('#profile_name').click(function() {
    $('#all-profile-objs').show();
    if ($('#main-body, #get-other-profile, #f-posts').is(':visible')) {
        $('#main-body, #get-other-profile, #f-posts').hide();
    }    
    $.ajax({
        type: 'GET',
        url: 'profile_page',
        success: function(response) {
            console.log(response);
            const pfData = response.profile_info;
            const posts = response.posts_data;
            console.log(pfData);
            console.log(posts)

            profileBox.innerHTML += ` 
            <p>Profile: ${pfData.user}</p>
            <p>Followers: ${pfData.count}</p>
            <p>Following: ${pfData.following}</p>
            `
            
            posts.forEach(el => { 
                profileObjs.innerHTML += `
                <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                        <a id="profile-link" class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p id="content-update-${el.id}" class="card-text c-t">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="delete-post-link" class="btn btn-primary deleteP" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Delete</a>
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
            getDeletePost();            
        },
        error: function(error) {
            console.log(error);
        }
    });
    
});
*/

let followVisible = 3

const followingProfiles = () => {
    $.ajax({
        type: 'GET',
        url: `follow_posts/${followVisible}`,
        success: function(response) {
            console.log(response);
            const fPosts = response.followed_profiles_objs;
            console.log(fPosts)


            fPosts.forEach(el => {
                followPosts.innerHTML += `
                <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                        <a class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p class="card-text">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="delete-post-link" class="btn btn-primary deleteP" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Delete</a>
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
            getDeletePost();
            //$('#follow-load-btn').show();
            console.log("This is for following posts " + response.sizer)
            setTimeout(() => {
                $('#follow-load-button').show();
            }, 500);
            if (response.sizer === 0) {
                followEndBox.textContent = 'No posts added yet ...'
            } 
            else if (response.sizer <= followVisible) {
                $('#follow-load-button').hide();
                followEndBox.textContent = 'No more posts to load ...'
            }
            
        },
        error: function(error) {
            console.log(error);
        }
    });
    
}

let toFollowLoaded = false;

$('#follow_posts').on('click', function() {
    
    $('#f-posts').show();
    if ($('#main-body, #get-other-profile, #all-profile-objs').is(':visible')) {
        $('#main-body, #get-other-profile, #all-profile-objs').hide();
    }
    $('#profile-load-btn').hide();

    //otherProfileStats.innerHTML = '';
    //otherProfilePosts.innerHTML = '';
    //postsBox.innerHTML = '';
    //followPosts.innerHTML = '';
    if (!toFollowLoaded) {
        followingProfiles();
    }
    toFollowLoaded = true;
    
    //setTimeout(() => {
        //$('#follow-load-btn').show();
    //}, 500);
});

followLoadBtn.addEventListener('click', () => {
    console.log("Follow click");
    followVisible += 3
    followingProfiles();
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

//getProfiles();
getData();