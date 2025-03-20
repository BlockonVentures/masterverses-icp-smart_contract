import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Metadata {
  'dob' : string,
  'name' : string,
  'description' : string,
  'email' : string,
  'address' : string,
  'gender' : string,
  'image' : string,
  'mobile' : string,
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
  'balanceOf' : ActorMethod<[Principal], bigint>,
  'getMetadata' : ActorMethod<[bigint], [] | [Metadata]>,
  'getUser' : ActorMethod<[Principal], [] | [User]>,
  'mint' : ActorMethod<[Principal, string, string], Result_1>,
  'ownerOf' : ActorMethod<[bigint], [] | [Principal]>,
  'register' : ActorMethod<
    [string, string, string, string, string, string],
    Result
  >,
  'tokensOfOwner' : ActorMethod<[Principal], Array<bigint>>,
  'totalSupply' : ActorMethod<[], bigint>,
  'transfer' : ActorMethod<[Principal, bigint], boolean>,
  'updateMetadata' : ActorMethod<
    [
      Principal,
      bigint,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
    boolean
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
