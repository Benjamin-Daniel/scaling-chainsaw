var group= {
    "_id": "59b526d0f3bde924d01350e7",
    "admin": "daniel",
    "name": "jand",
    "__v": 2,
    "posts": [
        {
            "username": "daniel",
            "message": "am with myself",
            "time": 1505077532410,
            "_id": "59b5a91c179f0f168cb751c9"
        },
        {
            "username": "daniel",
            "message": "am trying to code my website",
            "time": 1505077558006,
            "_id": "59b5a936179f0f168cb751ca"
        }
    ],
    "users": [
        "daniel"
    ]
}

group.posts.map(function(one, i) {
    console.log(one)
})

var messages = group.posts;
<div class="pull-right" id="main">
<div id="header">
    <% group.name %>
</div>
<% group.posts.map(function(message) { %>
    <div class="messages">
        <p><% message.message %></p>
        <p class="sentby"> <% message.username %></p>
    </div>
<%  })  %>
</div>
