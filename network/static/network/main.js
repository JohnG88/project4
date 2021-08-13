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
                    <input id="modal-input" type="text" class="form-control" name="edit-content-input">
                
                    <div class="modal-footer" id="submit-footer">
                        <input id="submit-footer-btn" type="submit" class="btn btn-primary save-edit-button" data-id="${postData.id}" value="Save Edit">
                    </div>
                </form>
                `

                $('#modal-input').val(`${postData.content}`)

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
        const editContent = $('#modal-input').val()
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
                document.getElementById(`content-update-${response.id}`).innerText = response.content;
                
                
                
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


$('#all-posts').click(function() {
    postsBox.innerHTML = '';
    $('#main-body').show();
    if ($('#all-profile-objs, #get-other-profile, #f-posts').is(':visible')) {
        $('#all-profile-objs, #get-other-profile,#f-posts').hide();
    }


    $('alert-box').hide();
    otherProfileStats.innerHTML = '';
    otherProfilePosts.innerHTML = '';
    $('#profile-no-box').hide();
    $('#all-follow-boxes').hide();
    $('#all-profile-boxes').hide();
    $('#all-posts-footers').hide();
    
    visible = 3
    getData();

});

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
            //const dataName = response.data.name



            data.forEach(el => {
                const postDiv = document.createElement('div');
                postDiv.id = `delete-card-id-${el.id}`;
                postDiv.classList.add('card', 'mb-2')
                postDiv.style.width = '30rem';
    
                const cardBodyDiv = document.createElement('div');
                cardBodyDiv.classList.add('card-body');
                postDiv.append(cardBodyDiv);
    
                const profileNameLink = document.createElement('a');
                profileNameLink.id = 'other-profile-ids';
                profileNameLink.classList.add('other-profile-id');
                profileNameLink.dataset.id = `${el.creator.id}`;
                profileNameLink.href = '#'
                cardBodyDiv.append(profileNameLink)
    
                const creatorName = document.createElement('h5');
                creatorName.classList.add('card-title');
                creatorName.textContent = `${el.creator.name}`;
                profileNameLink.append(creatorName)
    
                const dataInput = document.createElement('p');
                dataInput.id = `content-update-${el.id}`;
                dataInput.classList.add('card-text', 'c-t');
                dataInput.innerText = `${el.content}`;
                cardBodyDiv.append(dataInput);
    
                const dateInput = document.createElement('p');
                dateInput.classList.add('card-text');
                dateInput.textContent = `${el.created_date}`;
                cardBodyDiv.append(dateInput);
    
                const bottomDiv = document.createElement('div');
                bottomDiv.classList.add('card-footer');
                postDiv.append(bottomDiv)
    
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('row')
                bottomDiv.append(rowDiv);
    
                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                rowDiv.append(colDiv);
    
                const likeForm = document.createElement('form')
                likeForm.classList.add('like-unlike-forms');
                likeForm.dataset.formId = `${el.id}`;
                colDiv.append(likeForm);
    
                const likeButton = document.createElement('button');
                likeButton.href = '#';
                likeButton.id = `like-unlike-${el.id}`;
                likeButton.classList.add('btn', 'btn-primary');
                likeButton.textContent = `${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}`;
                likeForm.append(likeButton);

                postsBox.append(postDiv);
            });
            /*
            data.forEach(el => {
                postsBox.innerHTML += `
                <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 30rem;">
                    <div id="last-div" class="card-body">
                    <a id="other-profile-ids" class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p id="content-update-${el.id}" class="card-text c-t">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                        ${/*
                            <div class="col">
                                <a href="#" id="editP" class="btn btn-primary ePost" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Edit</a>
                            </div>
                        ''}
                            <div class="col">
                                <form class="like-unlike-forms" data-form-id="${el.id}">
                                    <button href="#" class="btn btn-primary" id="like-unlike-${el.id}">${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                `
                */
                /*
                if (el.creator.id !== user_id) {
                    $('.ePost').hide();
                } else if (el.creator.id == user_id) {
                    $('.ePost').show();
                };
                */
            //});
                
            
            getPost();
            likeUnlikePosts();
            $('#all-posts-footers').show();
            $('#all-profile-boxes').hide();
            $('#all-follow-boxes').hide();

            if (response.size === 0) {
                //profileEndBox.textContent = 'No posts added yet...'
                $('#start-box').show();
                $('#end-box').hide();
                $('#no-box').hide();
            }
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            //(response.sized <= profileVisible)
            else if (response.size <= visible) {
                $('#end-box').hide();
                $('#start-box').hide();
                $('#no-box').show();
                //profileEndBox.textContent = 'No more posts to load...'
            } else {
                $('#no-box').hide();
                setTimeout(() => {
                    $('#end-box').show();
                }, 500);
            }
            
            // Line below gets posts_ser from django view
            //const data = JSON.parse(response.posts_ser);
            //console.log(data);
            //$('#postList').html(response);
    
            //${el.content} - <b>${el.created_date}</b> - <p>${el.creator}</p><br>
            // Line below pops out a 7 in console, size id s from django view getAjax
            //console.log('This for all posts ' + response.size)
            // If size is 0 then add this quote to endBox 
            //if (response.size === 0) {
                //endBox.textContent = 'No posts added yet...'
            //}
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            //else if (response.size <= visible) {
                //loadBtn.classList.add('not-visible')
                //$('#load-btn').hide();
                //endBox.textContent = 'No more posts to load...'
            //}

        },
        error: function(err) {
            console.log(err);
        }
    });
}


getData();

const footerDiv = document.querySelector('#all-posts-footers');
const nextDiv = document.createElement('div');
nextDiv.id = 'start-box';
nextDiv.classList.add('text-center', 'mb-3');
nextDiv.textContent = 'No posts added yet...'

const lastDiv = document.createElement('div');
lastDiv.id = 'no-box';
lastDiv.classList.add('text-center', 'mb-3');
lastDiv.textContent = 'No more posts to load...'

footerDiv.append(nextDiv, lastDiv)




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

            const postDiv = document.createElement('div');
            postDiv.id = `delete-card-id-${data.id}`;
            postDiv.classList.add('card', 'mb-2')
            postDiv.style.width = '30rem';

            const cardBodyDiv = document.createElement('div');
            cardBodyDiv.classList.add('card-body');
            postDiv.append(cardBodyDiv);

            const profileNameLink = document.createElement('a');
            profileNameLink.id = 'other-profile-ids';
            profileNameLink.classList.add('other-profile-id');
            profileNameLink.dataset.id = `${data.creator_id}`;
            profileNameLink.href = '#'
            cardBodyDiv.append(profileNameLink)

            const creatorName = document.createElement('h5');
            creatorName.classList.add('card-title');
            creatorName.textContent = `${data.creator}`;
            profileNameLink.append(creatorName)

            const dataInput = document.createElement('p');
            dataInput.classList.add('card-text');
            dataInput.innerText = `${data.content}`;
            cardBodyDiv.append(dataInput);

            const dateInput = document.createElement('p');
            dateInput.classList.add('card-text');
            dateInput.textContent = `${data.created_date}`;
            cardBodyDiv.append(dateInput);

            const bottomDiv = document.createElement('div');
            bottomDiv.classList.add('card-footer');
            postDiv.append(bottomDiv)

            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row')
            bottomDiv.append(rowDiv);

            const colDiv = document.createElement('div');
            colDiv.classList.add('col');
            rowDiv.append(colDiv);

            const likeForm = document.createElement('form')
            likeForm.classList.add('like-unlike-forms');
            likeForm.dataset.formId = `${data.id}`;
            colDiv.append(likeForm);

            const likeButton = document.createElement('button');
            likeButton.href = '#';
            likeButton.id = `like-unlike-${data.id}`;
            likeButton.classList.add('btn', 'btn-primary');
            likeButton.textContent = 'Like (0)';
            likeForm.append(likeButton);
            
            //const lastDiv = document.querySelector('#last-div');
            //postsBox.insertBefore(postDiv, lastDiv.nextSibling);

            postsBox.prepend(postDiv);

            /*
            postsBox.insertAdjacentHTML('afterbegin', `
                <div id="delete-card-id-${data.id}" class="card mb-2" style="width: 30rem;">
                    <div class="card-body">
                        <a id="other-profile-ids" class="other-profile-id" data-id="${data.creator_id}" href="#"><h5 class="card-title">${data.creator}</h5></a>
                        <p class="card-text">${data.content}</p>
                        <p class="card-text">${data.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                        ${/*
                            <div class="col">
                                <a href="#" id="editP" class="btn btn-primary ePost" data-toggle="modal" data-target="#exampleModal" data-post-id="${data.id}">Edit</a>
                            </div>
                    ''}
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

console.log($('#id_content'))


$(document).on('click', '.other-profile-id', function(e) {    
    $('#profile-end-box').hide();
    otherProfilePosts.innerHTML = '';
    otherProfileStats.innerHTML = '';
    e.preventDefault();
    $('#get-other-profile').show();
    if ($('#main-body, #f-posts').is(':visible')) {
        $('#main-body, #f-posts').hide();
    }
    
    let profileId = $(this).attr('data-id');
    
    $.ajax({
        type: 'GET',
        url: 'get-profile-stats',
        data: {
            id: profileId
        },
        //cache: false,
        success: function(response) {
            console.log(response);
            
            const otherProfileInfo = response.single_profile_info;
            console.log(otherProfileInfo);
            /*
            <div id="profile-name-id" data-profile-id="${otherProfileInfo.id}">Profile: ${otherProfileInfo.user}</div>
            */
            const div = document.createElement('div')
            div.id = 'profile-name-id';
            div.dataset.profileId = `${otherProfileInfo.id}`
            div.innerText = `Profile: ${otherProfileInfo.user}`
            otherProfileStats.append(div)
            otherProfileStats.innerHTML +=`
            

            <div>Followers: <span id="change-count">${otherProfileInfo.count}</span></div>
            <div>Following: ${otherProfileInfo.following}</div>
            
            
            <form id="follow-unfollow-form" data-follow-id="${otherProfileInfo.id}">
                <button href="#" class="btn btn-primary" id="follow-unfollow-${otherProfileInfo.id}">${otherProfileInfo.followers ? `Unfollow` : `Follow`}</button>
            </form>
        
            `
            profileVisible = 3
            changeProfilePage();
            if(otherProfileInfo.id === user_id) {
                $('#follow-unfollow-form').hide();
            } else {
                $('#follow-unfollow-form').show();
            };
            
            
        },
        error: function(error) {
            console.log(error)
        }

    });
    

});


let profileVisible = 3

const changeProfilePage = () => {
    
    var profileIdWin = document.querySelector('#profile-name-id')
    console.log("Get id win " + profileIdWin.dataset.id)
    const profileIdPosts = profileIdWin.dataset.profileId;

        $.ajax({
            type: 'GET',
            url: `other-profile/${profileVisible}`,
            data: {
                id: profileIdPosts
            },
            //cache: false,
            success: function(response) {
                console.log(response);
                const otherProfileData = response.single_profile_objs;
                //const otherProfileInfo = response.single_profile_info;
                console.log(otherProfileData);
                //console.log(otherProfileInfo);
                
                otherProfileData.forEach(el => {
                const postDiv = document.createElement('div');
                postDiv.id = `delete-card-id-${el.id}`;
                postDiv.classList.add('card', 'mb-2')
                postDiv.style.width = '30rem';
    
                const cardBodyDiv = document.createElement('div');
                cardBodyDiv.classList.add('card-body');
                postDiv.append(cardBodyDiv);
    
                // const profileNameLink = document.createElement('a');
                // profileNameLink.id = 'other-profile-ids';
                // profileNameLink.classList.add('other-profile-id');
                // profileNameLink.dataset.id = `${el.creator.id}`;
                // profileNameLink.href = '#'
                // cardBodyDiv.append(profileNameLink)
    
                const creatorName = document.createElement('h5');
                creatorName.classList.add('card-title');
                creatorName.textContent = `${el.creator.name}`;
                cardBodyDiv.append(creatorName)
    
                const dataInput = document.createElement('p');
                dataInput.id = `content-update-${el.id}`;
                dataInput.classList.add('card-text', 'c-t');
                dataInput.innerText = `${el.content}`;
                cardBodyDiv.append(dataInput);
    
                const dateInput = document.createElement('p');
                dateInput.classList.add('card-text');
                dateInput.textContent = `${el.created_date}`;
                cardBodyDiv.append(dateInput);
    
                const bottomDiv = document.createElement('div');
                bottomDiv.classList.add('card-footer');
                postDiv.append(bottomDiv)
    
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('row')
                bottomDiv.append(rowDiv);
    
                const colDiv = document.createElement('div');
                colDiv.classList.add('col', 'first-col-div');
                rowDiv.append(colDiv);

                const postEditLink = document.createElement('a');
                postEditLink.href = '#'
                postEditLink.id = 'editP';
                postEditLink.classList.add('btn', 'btn-primary', 'ePost');
                postEditLink.dataset.toggle = 'modal';
                postEditLink.dataset.target = '#exampleModal';
                postEditLink.dataset.postId = `${el.id}`;
                postEditLink.textContent = 'Edit';
                colDiv.append(postEditLink)

                const secondColDiv = document.createElement('div');
                secondColDiv.classList.add('col', 'second-col-div');
                rowDiv.append(secondColDiv);

                const postDeleteLink = document.createElement('a');
                postDeleteLink.href = '#'
                postDeleteLink.id = 'delete-post-link';
                postDeleteLink.classList.add('btn', 'btn-primary', 'deleteP');
                postDeleteLink.dataset.toggle = 'modal';
                postDeleteLink.dataset.target = '#exampleModal';
                postDeleteLink.dataset.postId = `${el.id}`;
                postDeleteLink.textContent = 'Delete';
                secondColDiv.append(postDeleteLink)

                const thirdColDiv = document.createElement('div');
                thirdColDiv.classList.add('col', 'third-col-div');
                rowDiv.append(thirdColDiv);
    
                const likeForm = document.createElement('form')
                likeForm.classList.add('like-unlike-forms');
                likeForm.dataset.formId = `${el.id}`;
                thirdColDiv.append(likeForm);
    
                const likeButton = document.createElement('button');
                likeButton.href = '#';
                likeButton.id = `like-unlike-${el.id}`;
                likeButton.classList.add('btn', 'btn-primary');
                likeButton.textContent = `${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}`;
                likeForm.append(likeButton);



                otherProfilePosts.append(postDiv);

                if(el.creator_id === user_id) {
                    $('.first-col-div').show();
                    $('.second-col-div').show();
                    $('.third-col-div').remove();
                } else {
                    $('.first-col-div').remove();
                    $('.second-col-div').remove();
                    $('.third-col-div').show();
                };
            });
            /*
            otherProfileData.forEach(el => {
                otherProfilePosts.innerHTML += `
                <div id="delete-card-id-${el.id}" class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                    <h5 class="card-title">${el.creator.name}</h5>
                        <p id="content-update-${el.id}" class="card-text">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="editP" class="btn btn-primary ePost" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Edit</a>
                            </div>
                            <div class="col">
                                <a href="#" id="delete-post-link" class="btn btn-primary deleteP" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Delete</a>
                            </div>
                            ${/*
                            <div class="col">
                                <form class="like-unlike-forms" data-form-id="${el.id}">
                                    <button href="#" class="btn btn-primary" id="like-unlike-${el.id}">${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}</button>
                                </form>
                            </div>
                            ''}
                        </div>
                    </div>
                </div>
            `
            if(el.creator_id === user_id) {
                $('.deleteP').show();
            } else {
                $('.deleteP').remove();
            };

            });
            */
            getPost();
            likeUnlikePosts();
            getDeletePost();
            followUnfollowProfile();
            $('#all-profile-boxes').show();
            $('#all-follow-boxes').hide();
            $('#all-posts-footers').hide();
            if (response.sized === 0) {
                //profileEndBox.textContent = 'No posts added yet...'
                $('#profile-start-box').show();
                $('#profile-end-box').hide();
                $('#profile-no-box').hide();
            }
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            //(response.sized <= profileVisible)
            else if (response.sized <= profileVisible) {
                $('#profile-end-box').hide();
                $('#profile-start-box').hide();
                $('#profile-no-box').show();
                //profileEndBox.textContent = 'No more posts to load...'
            } else {
                $('#profile-no-box').hide();
                setTimeout(() => {
                    $('#profile-end-box').show();
                }, 500);
            }
            console.log('This is creator id ' + otherProfileData.creator_id);
            //profileVisible = 3
            
            
        },
        error: function(error) {
            console.log(error)
        }
        });
        //e.stopImmediatePropagation();
        //return false;
    //});
}

profileLoadButton.addEventListener('click', () => {
    //alert("Profile Button")
    console.log("Profile Button")
    //otherProfileStats.innerHTML = '';
    profileVisible += 3
    changeProfilePage();
    //e.stopImmediatePropagation();
    //return false;
});

//const elemHandler = function(e) {
    //profileVisible += 3
    //changeProfilePage();
    //e.stopImmediatePropagation()
//}

//console.log("pressed button")
//profileLoadButton.addEventListener('click', elemHandler);




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
                const postDiv = document.createElement('div');
                postDiv.id = `delete-card-id-${el.id}`;
                postDiv.classList.add('card', 'mb-2')
                postDiv.style.width = '30rem';
    
                const cardBodyDiv = document.createElement('div');
                cardBodyDiv.classList.add('card-body');
                postDiv.append(cardBodyDiv);
    
                const profileNameLink = document.createElement('a');
                profileNameLink.id = 'other-profile-ids';
                profileNameLink.classList.add('other-profile-id');
                profileNameLink.dataset.id = `${el.creator.id}`;
                profileNameLink.href = '#'
                cardBodyDiv.append(profileNameLink)
    
                const creatorName = document.createElement('h5');
                creatorName.classList.add('card-title');
                creatorName.textContent = `${el.creator.name}`;
                cardBodyDiv.append(creatorName)
    
                const dataInput = document.createElement('p');
                dataInput.id = `content-update-${el.id}`;
                dataInput.classList.add('card-text', 'c-t');
                dataInput.innerText = `${el.content}`;
                cardBodyDiv.append(dataInput);
    
                const dateInput = document.createElement('p');
                dateInput.classList.add('card-text');
                dateInput.textContent = `${el.created_date}`;
                cardBodyDiv.append(dateInput);
    
                const bottomDiv = document.createElement('div');
                bottomDiv.classList.add('card-footer');
                postDiv.append(bottomDiv)
    
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('row')
                bottomDiv.append(rowDiv);
    
                const colDiv = document.createElement('div');
                colDiv.classList.add('col');
                rowDiv.append(colDiv);

                const postReplyLink = document.createElement('a');
                postReplyLink.href = '#'
                postReplyLink.id = 'reply-post-link';
                postReplyLink.classList.add('btn', 'btn-primary');
                postReplyLink.dataset.toggle = 'modal';
                postReplyLink.dataset.target = '#exampleModal';
                postReplyLink.dataset.postId = `${el.id}`;
                postReplyLink.textContent = 'Reply';
                colDiv.append(postReplyLink)

                const secondColDiv = document.createElement('div');
                secondColDiv.classList.add('col');
                rowDiv.append(secondColDiv);

                const likeForm = document.createElement('form')
                likeForm.classList.add('like-unlike-forms');
                likeForm.dataset.formId = `${el.id}`;
                secondColDiv.append(likeForm);

                const likeButton = document.createElement('button');
                likeButton.href = '#';
                likeButton.id = `like-unlike-${el.id}`;
                likeButton.classList.add('btn', 'btn-primary');
                likeButton.textContent = `${el.likes ? `Unlike (${el.count})` : `Like (${el.count})`}`;
                likeForm.append(likeButton);
                
                followPosts.append(postDiv);
            });
            /*
            fPosts.forEach(el => {
                followPosts.innerHTML += `
                <div class="card mb-2" style="width: 18rem;">
                    <div class="card-body">
                        <a class="other-profile-id" data-id="${el.creator.id}" href="#"><h5 class="card-title">${el.creator.name}</h5></a>
                        <p class="card-text">${el.content}</p>
                        <p class="card-text">${el.created_date}</p>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col">
                                <a href="#" id="reply-post-link" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-post-id="${el.id}">Reply</a>
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
            */
            likeUnlikePosts();
            getDeletePost();
            $('#all-follow-boxes').show();
            $('#all-profile-boxes').hide();
            $('#all-posts-footers').hide();
            if (response.sizer === 0) {
                //profileEndBox.textContent = 'No posts added yet...'
                $('#follow-start-box').show();
                $('#follow-end-box').hide();
                $('#follow-no-box').hide();
            }
            // Else if size is greater than or = to visible posts then make load more button invisible and add quote instead
            //(response.sized <= profileVisible)
            else if (response.sizer <= followVisible) {
                $('#follow-end-box').hide();
                $('#follow-start-box').hide();
                $('#follow-no-box').show();
                //profileEndBox.textContent = 'No more posts to load...'
            } else {
                $('#follow-no-box').hide();
                $('#follow-start-box').hide();
                setTimeout(() => {
                    $('#follow-end-box').show();
                }, 500);
            }
            
        },
        error: function(error) {
            console.log(error);
        }
    });
    
}

//let toFollowLoaded = false;

$('#follow_posts').on('click', function() {
    $('#all-follow-boxes').hide();
    followPosts.innerHTML = '';
    $('#f-posts').show();
    if ($('#main-body, #get-other-profile, #all-profile-objs').is(':visible')) {
        $('#main-body, #get-other-profile, #all-profile-objs').hide();
    }
    
    otherProfileStats.innerHTML = '';
    otherProfilePosts.innerHTML = '';
    
    followVisible = 3
    followingProfiles();
});

followLoadBtn.addEventListener('click', () => {
    console.log("Follow click");
    followVisible += 3
    followingProfiles();
});


//getData();