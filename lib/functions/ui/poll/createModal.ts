import {IModify, IPersistence} from '@rocket.chat/apps-engine/definition/accessors';
import {RocketChatAssociationModel, RocketChatAssociationRecord} from '@rocket.chat/apps-engine/definition/metadata';
import {ButtonStyle, TextObjectType} from '@rocket.chat/apps-engine/definition/uikit';
import {IUIKitModalViewParam} from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import {IModalContext} from '../../../../definitions/Poll';
import {uuid} from '../../../utils';

export async function createModal({id = '', args, persistence, data, modify, options = 3}: {
    id?: string,
    args: Array<string>,
    persistence: IPersistence,
    data: IModalContext,
    modify: IModify,
    options?: number,
}): Promise<IUIKitModalViewParam> {
    const viewId = id || uuid();
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
    await persistence.createWithAssociation(data, association);

    const blockBuilder = modify.getCreator().getBlockBuilder();
    blockBuilder.addInputBlock({
        blockId: 'poll_question',
        label: blockBuilder.newPlainTextObject('调查问题'),
        element: blockBuilder.newPlainTextInputElement({
            actionId: 'question',
            placeholder: blockBuilder.newPlainTextObject('请输入调查问题'),
            initialValue: args[1],
            multiline: false,
        }),
        optional: false,
    })
        .addDividerBlock()
        .addInputBlock({
            blockId: 'poll_question',
            label: blockBuilder.newPlainTextObject('描述'),
            element: blockBuilder.newPlainTextInputElement({
                actionId: 'description',
                placeholder: blockBuilder.newPlainTextObject('请输入描述'),
                initialValue: '',
                multiline: true,
            }),
            optional: true,
        })
        .addDividerBlock()
        .addImageBlock({
            blockId: 'poll_image',
            title: {type: TextObjectType.PLAINTEXT, text: '钢铁侠', emoji: false},
            imageUrl: 'https://iknow-pic.cdn.bcebos.com/d058ccbf6c81800abba4bb4cb33533fa828b472a',
            altText: '钢铁侠提示语',
        });

    for (let i = 0; i < options; i++) {
        blockBuilder.addInputBlock({
            blockId: 'poll_question',
            label: blockBuilder.newPlainTextObject('投票选项' + i),
            element: blockBuilder.newPlainTextInputElement({
                actionId: `option-${i}`,
                placeholder: blockBuilder.newPlainTextObject('请输入投票选项'),
                initialValue: '',
                multiline: false,
            }),
            optional: false,
        });
    }
    blockBuilder.addDividerBlock();

    blockBuilder.addActionsBlock({
        blockId: 'config_addChoice_block',
        elements: [
            blockBuilder.newButtonElement({
                actionId: 'addChoice',
                text: blockBuilder.newPlainTextObject('新增选项'),
                value: String(options + 1),
                style: ButtonStyle.DANGER,
                url: 'http://www.baidu.com',
            }),
        ],
    });
    blockBuilder.addActionsBlock({
        blockId: 'config_mode_block',
        elements: [
            blockBuilder.newStaticSelectElement({
                actionId: 'mode',
                placeholder: blockBuilder.newPlainTextObject('单选/多选'),
                initialValue: 'multiple',
                options: [
                    {
                        text: blockBuilder.newPlainTextObject('单选'),
                        value: 'single',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('多选'),
                        value: 'multiple',
                    },
                ],
            }),
        ],
    });
    blockBuilder.addActionsBlock({
        blockId: 'config_visibility_block',
        elements: [
            blockBuilder.newStaticSelectElement({
                actionId: 'visibility',
                placeholder: blockBuilder.newPlainTextObject('公开/私密'),
                initialValue: 'open',
                options: [
                    {
                        text: blockBuilder.newPlainTextObject('公开'),
                        value: 'open',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('私密'),
                        value: 'confidential',
                    },
                ],
            }),
        ],
    });
    blockBuilder.addActionsBlock({
        blockId: 'config_reason_block',
        elements: [
            blockBuilder.newMultiStaticElement({
                actionId: 'reason',
                placeholder: blockBuilder.newPlainTextObject('喜欢原因'),
                initialValue: ['hair', 'color'],
                options: [
                    {
                        text: blockBuilder.newPlainTextObject('毛发'),
                        value: 'hair',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('颜色'),
                        value: 'color',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('外形'),
                        value: 'look',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('其它'),
                        value: 'other',
                    },
                ],
            }),
        ],
    });
    blockBuilder.addDividerBlock();

    // blockBuilder.addConditionalBlock()
    blockBuilder.addContextBlock({
        elements: [
            blockBuilder.newPlainTextObject('PlainText ContextBlock'),
            blockBuilder.newImageElement({
                imageUrl: 'https://iknow-pic.cdn.bcebos.com/d058ccbf6c81800abba4bb4cb33533fa828b472a',
                altText: '钢铁侠提示语',
            }),
            blockBuilder.newMarkdownTextObject('MarkdownText ContextBlock'),
        ],
    });
    blockBuilder.addDividerBlock();
    blockBuilder.addSectionBlock({
        text: blockBuilder.newMarkdownTextObject('SectionImageBlock'),
        accessory: blockBuilder.newImageElement({
            imageUrl: 'https://iknow-pic.cdn.bcebos.com/d058ccbf6c81800abba4bb4cb33533fa828b472a',
            altText: '钢铁侠提示语',
        }),
    });
    blockBuilder.addSectionBlock({
        text: blockBuilder.newMarkdownTextObject('SectionButtonBlock'),
        accessory: blockBuilder.newButtonElement({
            text: blockBuilder.newPlainTextObject('测试按钮'),
        }),
    });
    blockBuilder.addSectionBlock({
        text: blockBuilder.newPlainTextObject('SectionOverflowMenuBlock'),
        accessory: blockBuilder.newOverflowMenuElement({
            options: [
                {
                    text: blockBuilder.newPlainTextObject('男生'),
                    value: 'boy',
                },
                {
                    text: blockBuilder.newPlainTextObject('女生'),
                    value: 'girl',
                },
            ],
        }),
    });
    blockBuilder.addDividerBlock();

    return {
        id: viewId,
        title: blockBuilder.newPlainTextObject('创建投票调查'),
        submit: blockBuilder.newButtonElement({
            // text: blockBuilder.newPlainTextObject(args[1] || '确认'),
            text: blockBuilder.newPlainTextObject('确认'),
        }),
        close: blockBuilder.newButtonElement({
            // text: blockBuilder.newPlainTextObject(args[2] || '取消'),
            text: blockBuilder.newPlainTextObject('取消'),
        }),
        blocks: blockBuilder.getBlocks(),
    };
}
