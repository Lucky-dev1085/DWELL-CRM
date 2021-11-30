import { isEmpty } from 'lodash';
import React from 'react';
import { LineSkeleton } from 'src/utils';
import { TableColumn } from 'src/interfaces';

interface CallTableData {
  source: string,
  prospect_phone_number: string,
  call_result: string,
  recording: string,
  date: string,
  next_task_date: string,
  score: string,
  page: number,
  id: number,
}

interface Item {
  start_time: number,
  alternatives: {
    confidence: string,
    content: string
  }[],
  type: string
}

interface SpeakerLabel {
  speaker_label: string,
  start_time: number,
  end_time: number
}

interface TranscriptionData {
  results: {
    items: Item[],
    speaker_labels: { segments : SpeakerLabel[] }
  }
}

export const formatTranscription = (data: TranscriptionData): string => {
  if (isEmpty(data.results.items)) return 'No transcription data.';
  const { results: { items, speaker_labels: { segments } } } = data;
  let prevSpeaker = '';
  let result = '';
  let speakerLabel = 'Person B';
  let color = '#30bf87';
  segments.forEach((segment) => {
    if (prevSpeaker !== segment.speaker_label) {
      prevSpeaker = segment.speaker_label;
      speakerLabel = speakerLabel === 'Person A' ? 'Person B' : 'Person A';
      color = speakerLabel === 'Person A' ? '#0096FF' : '#30bf87';
      result += '<div class="dialog-segment-header">' +
        `<i class="fa fa-user-circle-o" style="font-size:22px;color:${color};margin-right:5px;"></i>` +
        `<strong>${speakerLabel}</strong></div>` +
        '<div class="dialog-segment-body">';
    } else {
      result += '<br class="small-space" /><div class="dialog-segment-body">';
    }
    const { start_time: startTime, end_time: endTime } = segment;
    const startItemIndex = items.findIndex(item => Number(item.start_time) === Number(startTime));
    const endItemIndex = items.findIndex(item => Number(item.start_time) >= Number(endTime));
    const segmentItems = endItemIndex > startItemIndex ? items.slice(startItemIndex, endItemIndex) : items.slice(startItemIndex);
    segmentItems.forEach((item, index) => {
      const max = Math.max(...item.alternatives.map(({ confidence }) => Number(confidence)));
      const value = item.alternatives.find(({ confidence }) => Number(confidence) === max).content;
      result += segmentItems[index + 1] && segmentItems[index + 1].type === 'punctuation' ? `${value}` : `${value} `;
    });
    result += '</div>';
  });
  return result;
};

export const overrideSpeakerLabelStyles = (speaker: string): void => {
  const rows = Array.from(document.querySelectorAll(`span[title="${speaker}"]`));
  rows.forEach((row) => {
    const label = speaker === 'Speaker 0' ? 'A' : 'B';
    const avatarColor = speaker === 'Speaker 0' ? '#15274d' : '#0168fa';
    const speakerElement = document.createElement('li') as HTMLElement;
    speakerElement.className = 'list-group-item';
    speakerElement.innerHTML = `<div class="avatar" style="background: ${avatarColor};"><span>${label}</span></div><div class="list-item-name text-nowrap">Person ${label}`;
    row.replaceWith(speakerElement);

    const timeElement = document.createElement('div');
    timeElement.className = 'list-item-time';
    timeElement.innerText = speakerElement.nextSibling.textContent;
    speakerElement.nextSibling.replaceWith(timeElement);

    const sibling = speakerElement.parentNode.nextSibling as HTMLElement;
    sibling.style.paddingLeft = '30px';
    sibling.style.paddingRight = '30px';
    sibling.style.margin = 'auto 0';

    const parent = speakerElement.parentNode.parentNode as HTMLElement;
    parent.style.marginTop = '3px';
    parent.style.marginBottom = '3px';

    const parentOfParent = speakerElement.parentNode.parentNode.parentNode as HTMLElement;
    parentOfParent.style.borderTopWidth = '1px';
    parentOfParent.style.borderColor = '#f0f2f9';
    parentOfParent.style.borderTopStyle = 'solid';
  });
};

export const defaultTableData = (): CallTableData[] => new Array(10).fill({
  source: '',
  prospect_phone_number: '',
  call_result: '',
  recording: '',
  date: '',
  next_task_date: '',
  score: '',
  page: 1,
}).map((item, index) => ({ ...item, id: index + 1 }));

export const defaultTableColumns = (leadId: number, isCallScorer: boolean): TableColumn[] => {
  let columns = [
    {
      dataField: 'id',
      text: '',
      formatter: () => (<LineSkeleton width={38} height={38} />),
    }, {
      dataField: 'source',
      text: leadId ? 'Phone Call' : 'Call Source',
      style: { width: '25%' },
      formatter: () => (<LineSkeleton width={150} height={12} />),
    }, {
      dataField: 'prospect_phone_number',
      classes: 'text-right',
      headerFormatter: () => <div className="text-right">Phone Number</div>,
      formatter: () => (<div className="text-right"><LineSkeleton width={100} /></div>),
    }, {
      dataField: 'call_result',
      text: 'Call Status',
      formatter: () => (<LineSkeleton width={100} />),
    }, {
      dataField: 'recording',
      text: 'Call Record',
      style: { width: '25%' },
      formatter: () => (<LineSkeleton width={100} />),
    }, {
      dataField: 'date',
      headerFormatter: () => <div className="text-right">Date</div>,
      formatter: () => (<div className="text-right"><LineSkeleton width={100} /></div>),
    }, {
      dataField: '',
      text: '',
      style: { width: '20%' },
      formatter: () => (<LineSkeleton style={{ display: 'none' }} />),
    },
  ];

  if (leadId) {
    columns = [...columns.filter(c => c.dataField)];
  }

  if (isCallScorer) {
    columns = [...columns.filter(c => !['isDropdownOpen', 'date', ''].includes(c.dataField)),
      {
        dataField: 'score',
        text: 'Score',
        style: { width: '10%' },
        formatter: () => (<LineSkeleton width={100} />),
      },
      {
        dataField: 'date',
        text: 'Date',
        style: { width: '10%' },
        formatter: () => (<LineSkeleton width={100} />),
      },
    ];
  }
  return columns;
};
