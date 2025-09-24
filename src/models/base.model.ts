export interface DateTime {
  createdAt: string;
  updateAt: string;
}

export interface Base extends DateTime {
  id: string;
}
