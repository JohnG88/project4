const postsBox = document.getElementById('post-list');
const loadBtn = document.getElementById('load-btn');
const endBox = document.getElementById('end-box');

const postForm = document.getElementById('post-form');
const title = document.getElementById('id_content');
const alertBox = document.getElementById('alert-box');

const profileBox = document.getElementById('profile-info');

const profileName = document.getElementById('profile-name');
const mainBody = document.getElementById('main-body');

const allPosts = document.getElementById('all-posts');


$('#profile-name').click(function() {
    $('#profile-info').show();
    if ($('#main-body').is(':visible')) {
        $('#main-body').hide();
    }
});

$('#all-posts').click(function() {
    $('#main-body').show();
    if ($('#profile-info').is(':visible')) {
        $('#profile-info').hide();
    }
})

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
                        <h5 class="card-title">${el.creator}</h5>
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
            likeUnlikePosts()
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
                        <h5 class="card-title">${data.creator}</h5>
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
            likeUnlikePosts()
            handleAlerts('success', 'New post added...')
            postForm.reset()
        },
        error: function(error) {
            console.log(error)
            handleAlerts('danger', 'oops....something went wrong')
        }
    });
})

const handleAlerts = (type, msg) => {
    alertBox.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${msg}
        </div>
    `
}
    
// .removeClass





$.ajax({
    type: 'GET',
    url: 'profile_page',
    success: function(response) {
        console.log(response);
        const pfData = response.data;
        console.log(pfData);
            profileBox.innerHTML += ` 
            <p>Profile: ${pfData.id}</p>
            <p>Following: ${pfData.following}</p>
            <p>Followers: ${pfData.followers}</p>
            `
    },
    error: function(error) {
        console.log(error);
    }
});

/*
$.ajax({
    type: 'GET',
    url: 'profile_page',
    success: function(response) {
        console.log(response);
        const pfData = response.data;
        console.log(pfData);
            profileBox.innerHTML += ` 
            <p>Profile: ${pfData.id}</p>
            <p>Following: ${pfData.following}</p>
            <p>Followers: ${pfData.followers}</p>
            `
    },
    error: function(error) {
        console.log(error);
    }
});
*/




getData();