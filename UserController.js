module.exports = class UserController{
  constructor(){
    this.userList = new Array();
  }
  getUsers(){ return this.userList; }
  userExists(pID){
    for(let i=0; i<this.userList.length; i++){
      if(this.userList[i].getConversationId() == pID){
       return true; 
      }
    }
    return false;
  }
  addUser(pUser){
    if(!this.userExists(pUser)){
      this.userList.push(pUser);
      return true;
    }
  }
  getUserByID(pID){
    for(let i=0; i<this.userList.length; i++){
      if(this.userList[i].getConversationId() == pID){
        return this.userList[i];
      }
    }
    return null;
  }
}