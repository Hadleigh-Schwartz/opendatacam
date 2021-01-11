import React, { PureComponent } from 'react'
import { Map } from 'immutable';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import OpenMoji from '../shared/OpenMoji.js';
import SVG from 'react-inlinesvg';
import { deleteRecording } from '../../statemanagement/app/HistoryStateManagement.js';
import { getCounterColor, getDisplayClasses } from '../../utils/colors.js';
import { COUNTING_AREA_TYPE } from '../../utils/constants.js';
import RecordingDeleteConfirmationModal from '../shared/RecordingDeleteConfirmationModal.js';

class Recording extends PureComponent {

  constructor(props) {
    super(props);

    this.DISPLAY_CLASSES = getDisplayClasses();

    this.state = {
      showDeleteConfirmationModal: false
    }
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  getMostCountedClasses(counterData, counterAreaId) {
    // Sorted by most counted first
    if(counterData.get(counterAreaId)) {
      let counterDataForThisArea = counterData.get(counterAreaId).remove("_total").sort((a, b) => {
        if (a < b) { return 1; }
        if (a > b) { return -1; }
        if (a === b) { return 0; }
      }).take(6);
      return counterDataForThisArea.toJS();
    } else {
      return [];
    }
  }

  getClassDisplayInfo(counterClass) {
    let displayInfo = this.DISPLAY_CLASSES.find((displayClass) => displayClass.class === counterClass);
    if(displayInfo) {
      return displayInfo
    } else {
      return {
        class: counterClass,
        hexcode: "25A1"
      }
    }
  }

  renderDateEnd(dateEnd, active = false) {
    if(!active) {
      return dayjs(dateEnd).format('hh:mm a')
    } else {
      return (
        <span className="font-bold" style={{color: "#FF0000"}}>Ongoing</span>
      )
    }
  }

  render() {

    return (
      <div className="flex flex-col flex-initial pl-2 mb-10 recording">
        <div className="m-2 flex">
          <div className="flex items-center flex-initial pl-6 text-inverse text-lg">
            <div>{dayjs(this.props.dateStart).format('MMM DD, YYYY')}</div>
            <div className="ml-10">
              {dayjs(this.props.dateStart).format('hh:mm a')} - {this.renderDateEnd(this.props.dateEnd, this.props.active)}
            </div>
            {this.props.filename &&
              <div className="ml-10">
                {this.props.filename}
              </div>
            }
          </div>
          <div>
          {!this.props.active &&
            <button
              className="p-0 ml-4 rounded shadow btn btn-default"
              onClick={() => this.setState({ showDeleteConfirmationModal: true})}
            >
              <SVG 
                className="flex items-center w-10 h-10 svg-icon" 
                cacheRequests={true}
                src={`/static/icons/ui/delete.svg`} 
                aria-label="icon close"
              />
            </button>
          }
          </div>
        </div>
        {this.state.showDeleteConfirmationModal &&
          <RecordingDeleteConfirmationModal 
            onCancel={() => this.setState({ showDeleteConfirmationModal: false})} 
            onConfirm={() => this.props.dispatch(deleteRecording(this.props.id))} 
          />
        }
        <div className="flex flex-wrap flex-initial pb-2 pl-1 m-2">
          {this.props.countingAreas.size > 0 &&
            <div className="flex flex-col flex-initial p-4 m-2 text-black bg-white rounded shadow">
              <div className="flex items-end justify-between">
                <h3 className="mr-3 text-xl font-bold">Counter</h3>
                <div>
                  <div className="inline-block font-medium">Download</div>
                </div>
              </div>
              <div className="flex justify-end items-end">
                <a className="mr-2 btn-text text-lg" href={`/recording/${this.props.id}/counter`} target="_blank" download>JSON</a>
                <a className="mr-2 btn-text text-lg" href={`/recording/${this.props.id}/counter/csv`} target="_blank" download>CSV</a>
                <a className="btn-text text-lg" href={`/recording/${this.props.id}/counter/geojson`} target="_blank" download>GEOJSON</a>
              </div>
              <div className="flex flex-wrap mt-4 h-full">
                {this.props.countingAreas && this.props.countingAreas.entrySeq().map(([countingAreaId, countingAreaData], index) =>
                  <div 
                    key={countingAreaId} 
                    className={`flex flex-col counter-area bg-gray-200 m-2 rounded p-4`}
                  >
                    <div className="flex items-center">
                      <h4 className="font-medium">{countingAreaData.get('name')}</h4>
                      <div className="w-4 h-4 ml-2 rounded-full" style={{'backgroundColor': getCounterColor(countingAreaData.get('color'))}}></div>
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.BIDIRECTIONAL &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-double.svg" />
                      }
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-up.svg" />
                      }
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-down.svg" />
                      }
                    </div>
                    <div className="flex flex-wrap flex-initial w-64 mt-5">
                      {this.props.counterData && Object.keys(this.getMostCountedClasses(this.props.counterData, countingAreaId)).map((counterClass) =>
                        <div 
                          className="flex items-center justify-center w-16 m-1" 
                          key={counterClass}
                        >
                          <h4 className="mr-2">{this.getMostCountedClasses(this.props.counterData, countingAreaId)[counterClass] || 0}</h4>
                          <OpenMoji
                            hexcode={this.getClassDisplayInfo(counterClass).hexcode}
                            class={counterClass}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          <div className="flex flex-col flex-initial p-4 m-2 text-black bg-white rounded shadow">
            <div className="flex items-end justify-between">
              <h3 className="mr-3 text-xl font-bold">Tracker</h3>
              <div className="inline-block font-medium">Download</div>
            </div>
            <div className="flex items-end justify-end">
                <a className="mr-2 btn-text text-lg" href={`/recording/${this.props.id}/tracker`} target="_blank" download>JSON</a>
                <a className="btn-text text-lg" href={`/recording/${this.props.id}/tracker/geojson`} target="_blank" download>GEOJSON</a>
            </div>
            <div className="relative mt-6 rounded">
              <div className="absolute text-white" style={{ bottom: 10, left : 10}}>
                <h2 className="inline text-4xl font-bold">{this.props.nbPaths}</h2> objects tracked
              </div>
              <img src="/static/pathview.jpg" />
            </div>
          </div>
        </div>
        <style jsx>{`
          {/* Didn't succeed to make this better: https://stackoverflow.com/questions/54384305/dynamic-width-parent-with-flexbox-column-wrapping 
            Seems cannot have container parent width shrink when some element are wrapping
          */}
          .counter-area {
            max-width: 350px;
            flex: 1;
          }

          .icon-direction {
            margin-left: 5px;
            width: 20px;
            height: 20px;
          }
        `}</style>
      </div>
    )
  }
}

export default connect()(Recording)
