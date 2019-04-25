module.exports = class User{
  constructor(pUid,pConid,pBlocked){
    this.userId = pUid;
    this.conversationId = pConid;
    this.blocked = pBlocked;
    this.context = null;
    this.lastMessage = "";
  }
  getUserId(){ return this.userId; }
  getConversationId(){ return this.conversationId; }
  getBlocked(){ return this.blocked; }
  setBlocked(pBlocked){ this.blocked = pBlocked; }
  setConversationId(pConid){ this.conversationId = pConid; }
  setUserId(pUid){ this.userId = pUid; }
  getContext(){ return this.context; }
  setContext(pContext){ this.context = pContext; }
  setLastMessage(pMessage){ this.lastMessage = pMessage; }
  getLastMessage() { return this.lastMessage; }
}