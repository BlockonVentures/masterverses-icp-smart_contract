import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Event {
  'eventId' : bigint,
  'title' : string,
  'creator' : Principal,
  'date' : string,
  'description' : string,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export interface User {
  'dob' : string,
  'name' : string,
  'email' : string,
  'address' : string,
  'gender' : string,
  'mobile' : string,
}
export interface _SERVICE {
  'createEvent' : ActorMethod<[Principal, string, string, string], Result_1>,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getUser' : ActorMethod<[Principal], [] | [User]>,
  'getUserEvents' : ActorMethod<[Principal], Array<Event>>,
  'mint' : ActorMethod<[Principal, string, string], Result_1>,
  'register' : ActorMethod<
    [Principal, string, string, string, string, string, string],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
