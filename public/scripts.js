var app = new Vue({
  el: '#app',
  data: {
    username: "Bob",
    draftText: "",
    file: null,
    draftURL: null,

    posts: []
  },
  created(){
    this.getPosts();
  },
  computed: {
  },
  methods: {
    async getPosts() {
      try {
        let response = await axios.get("/api/posts");
        this.posts = response.data;
        this.sortPosts();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    fileChanged(event) {
      this.file = event.target.files[0];

      var input = event.target;
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
          // create a new FileReader to read this image and convert to base64 format
          var reader = new FileReader();
          // Define a callback function to run, when FileReader finishes its job
          reader.onload = (e) => {
              // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
              // Read image as base64 and set to imageData
              this.draftURL = e.target.result;
          }
          // Start the reader job - read file as a data url (base64 format)
          reader.readAsDataURL(input.files[0]);
      }
    },
    sortPosts(){
      this.posts.sort(function(a, b){return b.date - a.date});
    },
    async upload() {
      try {
        let now = new Date()
        if (this.file != null){
          const formData = new FormData();
          formData.append('photo', this.file, this.file.name)
          let r1 = await axios.post('/api/photos', formData);
          let r2 = await axios.post('/api/posts', {
            username: this.username,
            date: now.getTime(),
            text: this.draftText,
            imgBool: true,
            img: r1.data.path,
            editBool: false,
            likes: 0
          });
          this.posts.push(r2.data)
          this.sortPosts()
        } else {
          let r2 = await axios.post('/api/posts', {
            username: this.username,
            date: now.getTime(),
            text: this.draftText,
            imgBool: false,
            img: "nil",
            editBool: false,
            likes: 0
          });
          this.posts.push(r2.data)
          this.sortPosts()
        }

        this.draftText = ""
        this.file = null
        this.draftURL = null

      } catch (error) {
        console.log(error);
      }
    },
    async deletePost(post) {
      try {
        console.log("Deleting " + post._id)
        let response = axios.delete("/api/posts/" + post._id);
        post.editBool = false;
        this.getPosts();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    edit(post){
      post.editBool = !post.editBool
    },
    async editPost(post) {
      try {
        let response = await axios.put("/api/posts/" + post._id, {
          text: post.text
        });
        this.findItem = null;
        post.editBool = false;
        this.getPosts();
        return true;
      } catch (error) {
        console.log("EDIT ERROR: " + error);
      }
    },
  }
});
