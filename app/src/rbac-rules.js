const rules = {
    visitor: {
      static: ["posts:list", "home-page:visit"]
    },
    student: {
      static: [
        "posts:list",
        "posts:create",
        "users:getSelf",
        "home:visit",
        "calendar:visit"
      ],
      dynamic: {
        "posts:edit": ({userId, postOwnerId}) => {
          if (!userId || !postOwnerId) return false;
          return userId === postOwnerId;
        }
      }
    },
    mentor: {
      static: [
        "posts:list",
        "posts:create",
        "posts:edit",
        "posts:delete",
        "users:get",
        "users:getSelf",
        "home-page:visit",
        "dashboard-page:visit"
      ]
    }
  };
  
  export default rules;