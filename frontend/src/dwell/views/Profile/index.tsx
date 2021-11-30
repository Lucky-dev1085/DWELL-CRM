import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ImageCompressor from 'image-compressor.js';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { Row, Col, FormGroup, Input, FormFeedback, Button, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { ImageUpload } from 'dwell/components';
import actions from 'dwell/actions';
import { imageCompressOption } from 'dwell/constants';
import { ModalWindow as Modal } from 'site/components/common';
import 'src/scss/pages/_profile.scss';
import { DetailResponse, CustomBlob } from 'src/interfaces';

const ModalWindow = styled(Modal)`
  max-width: 560px;

  .modal-title {
    font-size: 20px !important;
  }
`;

const ModalFormLabel = styled.label`
  font-size: 13px;
  color: rgba(101,118,151,0.75);
  margin-bottom: 6px;
`;

const UserAvatar = styled.div`
  background-color: #929eb9;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 50%;
  margin-bottom: 15px;
  font-size: 48px;

  img {
    width: 100%;
    height: 140px;
    border-radius: 50%;
  }
`;

const UploadButton = styled(Button)`
  background-color: #f0f2f9 !important;
  border-color: transparent !important;
  color: #0b2151;
  box-shadow: 0 1px 5px rgba(9,21,52,0.06);
  justify-content: center;
  width: 100%;
  height: 38px;

  &:hover {
    background-color: #e1e6f7 !important;
    box-shadow: 0 1px 5px rgba(9,21,52,0.12);
  }
`;

const UserInfoInput = styled(Input)`
  font-weight: 500;

  &:disabled {
      background-color: white;
  }
`;

const ChangePasswordLink = styled.a`
    font-size: 13px;
    font-weight: 500;
    color: #0168fa !important;
    text-decoration: none;
    background-color: transparent;
    cursor: pointer;

    &:hover {
        color: #015de1 !important;
    }
`;

interface User {
  id?: number,
  first_name?: string,
  last_name?: string,
  email?: string,
  avatar?: string,
  change_password?: boolean,
  avatarFile?: CustomBlob,
  current_password?: string,
  new_password?: string,
  confirm_password?: string,
}

interface Error {
  current_password?: string,
  new_password?: string,
  confirm_password?: string,
}

interface ProfileProps extends RouteComponentProps {
  currentUser: User,
  isSubmitting: boolean,
  show: boolean,
  handleClose: () => void,
  updateUser: (id: number, formData: FormData) => Promise<DetailResponse>,
}

const Profile: FC<ProfileProps> = ({ currentUser, updateUser, isSubmitting, show, handleClose }) => {
  const [user, setUser] = useState({ avatarFile: null, avatar: null } as User);
  const [error, setError] = useState({} as Error);

  const updateUserState = (props) => {
    // eslint-disable-next-line camelcase
    const { id, first_name, last_name, email, avatar } = props;
    setUser({ ...user, id, first_name, last_name, email, avatar });
  };

  const validate = () => {
    const newErrors = {};
    if (user.change_password) {
      ['current_password', 'new_password', 'confirm_password'].forEach((field) => {
        if (!user[field]) newErrors[field] = 'Please input a password';
        else if (user[field].length < 6) newErrors[field] = 'Password needs to be at least 6 characters long';
      });
    }
    setError(newErrors);
    return newErrors;
  };

  useEffect(() => {
    updateUserState(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!isEmpty(error)) validate();
  }, [user]);

  const handleSave = () => {
    if (!isEmpty(validate())) return;
    const formData = new FormData();
    Object.keys(user).forEach((key) => {
      if (key === 'avatar') {
        if (user.avatarFile) formData.append(key, user.avatarFile, user.avatarFile.name);
      } else if (!(!user.change_password && ['current_password', 'new_password', 'confirm_password'].includes(key))) {
        formData.append(key, user[key]);
      }
    });
    updateUser(user.id, formData).then(() => {
      handleClose();
      setUser({ ...user, current_password: '', new_password: '', confirm_password: '', change_password: false });
    });
  };

  const handleInputChange = ({ target: { id, value } }) => {
    setUser({ ...user, [id]: value });
  };

  const handleFileUpload = (file) => {
    const imageCompressor = new ImageCompressor();
    const blob = new Blob([file[0]], { type: file[0].type });
    imageCompressor.compress(blob, imageCompressOption)
      .then((result) => {
        const resultAvatar: CustomBlob = result;
        resultAvatar.lastModifiedDate = new Date();
        resultAvatar.name = file[0].name;
        setUser({ ...user, avatar: file[0].preview, avatarFile: resultAvatar });
      });
  };

  const { first_name: firstName, last_name: lastName, email, avatar, current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword, change_password: changePassword } = user;

  return (
    <ModalWindow isOpen={show} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>My Profile</ModalHeader>
      <ModalBody className="pb-0">
        <Row>
          <Col xs="8">
            <Row>
              <Col xs="12">
                <FormGroup>
                  <ModalFormLabel htmlFor="first_name">First Name</ModalFormLabel>
                  <UserInfoInput
                    type="text"
                    name="first_name"
                    id="first_name"
                    onChange={handleInputChange}
                    value={firstName || ''}
                    required
                  />
                  <FormFeedback>First name is required.</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <ModalFormLabel htmlFor="last_name">Last Name</ModalFormLabel>
                  <UserInfoInput
                    type="text"
                    name="last_name"
                    id="last_name"
                    onChange={handleInputChange}
                    value={lastName || ''}
                    required
                  />
                  <FormFeedback>Last name is required.</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <ModalFormLabel htmlFor="email">Email</ModalFormLabel>
                  <UserInfoInput
                    type="text"
                    name="email"
                    id="email"
                    onChange={handleInputChange}
                    placeholder="Enter an email"
                    value={email || ''}
                    required
                  />
                  <FormFeedback>Last name is required.</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <ChangePasswordLink
                    onClick={() => handleInputChange({ target: { id: 'change_password', value: !changePassword } })}
                  >
                    Change Password
                  </ChangePasswordLink>
                </FormGroup>
                {changePassword && (
                  <React.Fragment>
                    <FormGroup>
                      <ModalFormLabel htmlFor="old_password">Current Password</ModalFormLabel>
                      <Input
                        type="password"
                        name="current_password"
                        id="current_password"
                        placeholder="Enter a current password"
                        value={currentPassword || ''}
                        onChange={handleInputChange}
                        invalid={error.current_password}
                        required
                      />
                      <FormFeedback>{error.current_password}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <ModalFormLabel htmlFor="new_password">New Password</ModalFormLabel>
                      <Input
                        type="password"
                        name="new_password"
                        id="new_password"
                        placeholder="Enter a new password"
                        value={newPassword || ''}
                        onChange={handleInputChange}
                        invalid={error.new_password}
                        required
                      />
                      <FormFeedback>{error.new_password}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <ModalFormLabel htmlFor="confirm_password">Confirm New Password</ModalFormLabel>
                      <Input
                        type="password"
                        name="confirm_password"
                        id="confirm_password"
                        placeholder="Enter a confirm password"
                        value={confirmPassword || ''}
                        onChange={handleInputChange}
                        invalid={error.confirm_password}
                        required
                      />
                      <FormFeedback>{error.confirm_password}</FormFeedback>
                    </FormGroup>
                  </React.Fragment>
                )}
              </Col>
            </Row>
          </Col>
          <Col>
            <FormGroup>
              <ModalFormLabel htmlFor="email">Profile Photo</ModalFormLabel>
              {avatar ? (
                <UserAvatar>
                  <img src={avatar} alt="avatar" />
                </UserAvatar>
              ) :
                (
                  <UserAvatar>
                    {firstName ? firstName[0] : 'N'}{lastName ? lastName[0] : 'A'}
                  </UserAvatar>
                )}
              <ImageUpload
                onDropAccepted={e => handleFileUpload(e)}
                title="Upload Image"
                dropzoneContainer={() => <UploadButton>Upload photo</UploadButton>}
                dropzoneClassname="image-upload"
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="white" type="button" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="btn" color="primary" onClick={handleSave} disabled={isSubmitting}>Save changes</Button>
      </ModalFooter>
    </ModalWindow>
  );
};

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  isSubmitting: state.user.isSubmitting,
});

export default connect(
  mapStateToProps,
  {
    ...actions.user,
  },
)(withRouter(Profile));
