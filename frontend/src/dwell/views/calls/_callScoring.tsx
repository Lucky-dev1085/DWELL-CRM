import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardTitle, CardHeader, CustomInput, Spinner } from 'reactstrap';
import { isEmpty } from 'lodash';
import 'src/scss/pages/_calls.scss';
import scoredCallsAction from 'dwell/actions/scored_calls';
import propertyAction from 'dwell/actions/property';
import { getPropertyId } from 'src/utils';
import { CallTransCard, CallScoringCardBody } from 'dwell/views/calls/styles';
import { PrimaryButton } from 'styles/common';
import { CustomDropdownItem, DropdownLink, StageDropdown, StageDropdownMenu } from 'dwell/views/lead/layout/nav/styles';

interface CallScoringProps {
  callId: number,
  onSubmitSuccess: (id: number) => void,
  changeCallScore: (id: number, score: string | number) => void,
}

const CallScoring: FC<CallScoringProps> = ({ callId, onSubmitSuccess, changeCallScore }) => {
  const [questionState, setQuestionState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [teamUsers, setTeamUsers] = useState([]);

  const dispatch = useDispatch();
  const questions = useSelector(state => state.callScoringQuestions.questions);
  const scoredCalls = useSelector(state => state.scoredCalls.scoredCalls);
  const isSubmitting = useSelector(state => state.scoredCalls.isSubmitting);
  const property = useSelector(state => state.property.property);
  const users = useSelector(state => state.user.users);

  const { createScoredCall, updateScoredCallById, getCallRescoresMeta } = scoredCallsAction;
  const { setPropertyAsScored } = propertyAction;

  useEffect(() => {
    let filteredUsers = property.users;
    if (!isEmpty(scoredCalls)) {
      const currentCall = scoredCalls.find(sc => sc.call === callId);
      if (currentCall) {
        setCurrentAgent(currentCall.agent);
        const answeredQuestionState = currentCall.questions.reduce((a, b) => ({ ...a, [b]: 'yes' }), {});
        const omittedQuestionState = currentCall.omitted_questions.reduce((a, b) => ({ ...a, [b]: 'omit' }), {});
        setQuestionState({ ...answeredQuestionState, ...omittedQuestionState });

        filteredUsers = property.external_id === 'call-rescores' ? users.filter(i => i.properties.includes(currentCall.property)) : property.users;
      }
    }
    setTeamUsers(filteredUsers);
  }, [scoredCalls]);

  const handleQuestionCheck = ({ target: { id } }, state) => {
    const questionId = id.split('-')[1];
    const newQuestionState = { ...questionState, [questionId]: state };
    setQuestionState(newQuestionState);

    const yesQuestions = Object.keys(newQuestionState).filter(key => newQuestionState[key] === 'yes');
    const omitQuestions = Object.keys(newQuestionState).filter(key => newQuestionState[key] === 'omit');
    const questionsWeight = questions.reduce((a, q) => (!omitQuestions.includes(q.id.toString()) ? a + q.weight : a), 0);
    const checkedQuestionsWeight = questions.reduce((a, q) => (yesQuestions.includes(q.id.toString()) ? a + q.weight : a + 0), 0);
    const callScore = (checkedQuestionsWeight * 100) / questionsWeight;
    changeCallScore(callId, omitQuestions.length === questions.length ? 'N/A' : +callScore.toFixed(1));
  };

  const yesQuestions = Object.keys(questionState).filter(key => questionState[key] === 'yes');
  const noQuestions = Object.keys(questionState).filter(key => questionState[key] === 'no');
  const omitQuestions = Object.keys(questionState).filter(key => questionState[key] === 'omit');

  const saveScoring = () => {
    if (!isSubmitting) {
      const scoredCall = scoredCalls.find(sc => sc.call === callId);
      setIsLoading(true);
      const params = {
        questions: yesQuestions.map(q => parseInt(q, 10)),
        omitted_questions: omitQuestions.map(q => parseInt(q, 10)),
        agent: currentAgent,
      };
      if (scoredCall) {
        dispatch(updateScoredCallById(scoredCall.id, params)).then(() => {
          setIsLoading(false);
          onSubmitSuccess(callId);
          dispatch(getCallRescoresMeta());
        });
      } else {
        dispatch(createScoredCall({ call: callId, ...params })).then(() => {
          setIsLoading(false);
          onSubmitSuccess(callId);
          dispatch(setPropertyAsScored(Number(getPropertyId())));
        });
      }
    }
  };

  const setAgent = () => {
    const agent = teamUsers.find(a => a.id === currentAgent);
    if (agent) {
      return `${agent.first_name} ${agent.last_name}`;
    }
    return 'Select an agent';
  };

  return (
    <CallTransCard isCallScoring>
      <CardHeader>
        <CardTitle>Call scoring</CardTitle>
        <StageDropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
          <DropdownLink caret>
            {setAgent()}
          </DropdownLink>
          <StageDropdownMenu>
            {teamUsers.map(user => (
              <React.Fragment key={user.id} >
                <CustomDropdownItem onClick={() => setCurrentAgent(user.id)}>
                  {user.first_name} {user.last_name}
                </CustomDropdownItem>
              </React.Fragment>))}
          </StageDropdownMenu>
        </StageDropdown>
      </CardHeader>
      <CallScoringCardBody className="d-flex flex-column justify-content-between">
        <div>
          {questions.sort((a, b) => a.order - b.order).map((q, index) => (
            <div className="mb-3" key={index}>
              <div className="mb-1">Question {q.order}: {q.question}</div>
              <div className="d-flex pl-2">
                <CustomInput id={`${callId}-${q.id}-yes`} checked={yesQuestions.includes(q.id.toString())} onChange={e => handleQuestionCheck(e, 'yes')} type="radio" className="text-success">
                  Yes
                </CustomInput>
                <CustomInput id={`${callId}-${q.id}-no`} checked={noQuestions.includes(q.id.toString())} onChange={e => handleQuestionCheck(e, 'no')} type="radio" className="ml-2 text-danger">
                  No
                </CustomInput>
                {!q.is_not_omitting &&
                <CustomInput id={`${callId}-${q.id}-omit`} checked={omitQuestions.includes(q.id.toString())} onChange={e => handleQuestionCheck(e, 'omit')} type="radio" className="ml-2 text-warning">
                  Omit
                </CustomInput>}
              </div>
            </div>))}
        </div>
        <div className="d-flex justify-content-center">
          <PrimaryButton onClick={() => saveScoring()} disabled={yesQuestions.length + noQuestions.length + omitQuestions.length !== questions.length}>
            {isSubmitting && isLoading ? <Spinner size="sm" /> : 'Submit'}
          </PrimaryButton>
        </div>
      </CallScoringCardBody>
    </CallTransCard>
  );
};

export default CallScoring;
