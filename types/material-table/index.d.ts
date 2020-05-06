import 'material-table';

declare module 'material-table' {
  export default interface MaterialTable {
    onAllSelected(selectAll: boolean);
  }
}
