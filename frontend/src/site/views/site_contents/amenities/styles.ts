import styled from 'styled-components';

export const AmenitiesNavBar = styled.div`
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
`;

export const NavbarAdd = styled.div`
.btn {
  height: 40px;
  width: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

export const AddIcon = styled.div`
  background: url(/static/images/plus-white.svg);
  background-size: cover;
  width: 20px;
  height: 20px;
  margin: auto;
`;

export const TagsWrapper = styled.div`
  padding: 5px;
  box-shadow: none;
  border-radius: 5px;
  max-width: 100%;
  line-height: 22px;
  color: #555;
  vertical-align: middle;
  background-color: #fff;
  border: 1px solid ${props => props.theme.input.borderColor};

  div.ReactTags__tags {
    position: relative;
  }

  div.ReactTags__tagInput {
    width: 200px;
    border-radius: 2px;
    display: inline-block;
  }

  div.ReactTags__tagInput input.ReactTags__tagInputField,
  div.ReactTags__tagInput input.ReactTags__tagInputField:focus {
    height: 31px;
    margin: 0;
    font-size: 13px;
    width: 100%;
    border: 1px solid #eee;
    padding: 0 4px;
    border-radius: 4px;
    outline: none;
  }

  div.ReactTags__selected span.ReactTags__tag {
    margin: 3px 5px;
    cursor: move;
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    background-color: #ddebff;
    color: ${props => props.theme.colors.colorui01};
    padding: 5px 15px 5px 10px;
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.colorui01};
  }
  div.ReactTags__selected a.ReactTags__remove {
    color: #aaa;
    margin-left: 5px;
    cursor: pointer;
  }

  .ReactTags__tagInputField {
    border-width: 0 !important;
  }
`;
