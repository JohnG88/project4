const profileBox = document.getElementById('profile-info');
const profileData = () => {
    $(document).ready(function()  {
        $.ajax({
            type: 'GET',
            url: 'profile_page',
            success: function(response) {
                console.log(response)
                profileBox.innerHTML = `
                    <p>${response.id} - ${response.followers} | ${response.following}
                    </p>
                `
            }
        })
    })
}
profileData();